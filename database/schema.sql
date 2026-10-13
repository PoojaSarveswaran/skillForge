-- ============================================================================
-- SkillForge AI — Database Schema (MySQL 8+)
-- ============================================================================
-- Run with:  mysql -u <user> -p skillforge < database/schema.sql
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS roadmap_items;
DROP TABLE IF EXISTS roadmaps;
DROP TABLE IF EXISTS project_skills;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS user_skills;
DROP TABLE IF EXISTS role_skills;
DROP TABLE IF EXISTS career_roles;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------------------------
-- users — demo-grade account storage (bcrypt-hashed passwords only)
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id                      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email                   VARCHAR(190) NOT NULL,
    password_hash           VARCHAR(255) NOT NULL,
    display_name            VARCHAR(120) NOT NULL,
    education_stage         VARCHAR(160) DEFAULT NULL,
    weekly_availability_hours SMALLINT UNSIGNED NOT NULL DEFAULT 5,
    career_goals            TEXT DEFAULT NULL,
    target_role_id          INT UNSIGNED DEFAULT NULL,
    created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- career_roles — seed-managed role catalog (editable data, not hardcoded UI)
-- ----------------------------------------------------------------------------
CREATE TABLE career_roles (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug            VARCHAR(80) NOT NULL,
    title           VARCHAR(120) NOT NULL,
    category        VARCHAR(60) NOT NULL,
    icon            VARCHAR(10) DEFAULT NULL,
    short_description  VARCHAR(255) NOT NULL,
    long_description   TEXT NOT NULL,
    key_responsibilities JSON NOT NULL,
    learning_sequence     JSON NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_roles_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE users
    ADD CONSTRAINT fk_users_target_role
    FOREIGN KEY (target_role_id) REFERENCES career_roles(id) ON DELETE SET NULL;

-- ----------------------------------------------------------------------------
-- role_skills — required skills per role, with prerequisite chaining
-- ----------------------------------------------------------------------------
CREATE TABLE role_skills (
    id                      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role_id                 INT UNSIGNED NOT NULL,
    skill_name              VARCHAR(100) NOT NULL,
    category                VARCHAR(60) NOT NULL,
    target_proficiency      TINYINT UNSIGNED NOT NULL,
    importance              ENUM('low','medium','high','critical') NOT NULL DEFAULT 'medium',
    prerequisite_skill_name VARCHAR(100) DEFAULT NULL,
    created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_role_skills_role FOREIGN KEY (role_id) REFERENCES career_roles(id) ON DELETE CASCADE,
    CONSTRAINT chk_target_proficiency CHECK (target_proficiency BETWEEN 0 AND 4),
    UNIQUE KEY uq_role_skill (role_id, skill_name),
    INDEX idx_role_skills_role (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- user_skills — self-assessed current proficiency
-- ----------------------------------------------------------------------------
CREATE TABLE user_skills (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         INT UNSIGNED NOT NULL,
    skill_name      VARCHAR(100) NOT NULL,
    category        VARCHAR(60) NOT NULL DEFAULT 'General',
    proficiency     TINYINT UNSIGNED NOT NULL DEFAULT 0,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_skills_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_proficiency CHECK (proficiency BETWEEN 0 AND 4),
    UNIQUE KEY uq_user_skill (user_id, skill_name),
    INDEX idx_user_skills_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- roadmaps — one active roadmap per (user, role) pair
-- ----------------------------------------------------------------------------
CREATE TABLE roadmaps (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED NOT NULL,
    role_id     INT UNSIGNED NOT NULL,
    title       VARCHAR(160) NOT NULL,
    status      ENUM('active','archived') NOT NULL DEFAULT 'active',
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_roadmaps_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_roadmaps_role FOREIGN KEY (role_id) REFERENCES career_roles(id) ON DELETE CASCADE,
    INDEX idx_roadmaps_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- roadmap_items — milestones/tasks, self-referencing for prerequisites
-- ----------------------------------------------------------------------------
CREATE TABLE roadmap_items (
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    roadmap_id          INT UNSIGNED NOT NULL,
    title               VARCHAR(160) NOT NULL,
    item_type           ENUM('milestone','task') NOT NULL DEFAULT 'milestone',
    skill_name          VARCHAR(100) DEFAULT NULL,
    description         TEXT DEFAULT NULL,
    priority            ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
    estimated_hours     SMALLINT UNSIGNED NOT NULL DEFAULT 5,
    status              ENUM('todo','in_progress','completed') NOT NULL DEFAULT 'todo',
    order_index         SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    prerequisite_item_id INT UNSIGNED DEFAULT NULL,
    completed_at        TIMESTAMP NULL DEFAULT NULL,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_items_roadmap FOREIGN KEY (roadmap_id) REFERENCES roadmaps(id) ON DELETE CASCADE,
    CONSTRAINT fk_items_prereq FOREIGN KEY (prerequisite_item_id) REFERENCES roadmap_items(id) ON DELETE SET NULL,
    INDEX idx_items_roadmap (roadmap_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- projects — recommendation catalog
-- ----------------------------------------------------------------------------
CREATE TABLE projects (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug            VARCHAR(100) NOT NULL,
    title           VARCHAR(160) NOT NULL,
    description     TEXT NOT NULL,
    difficulty      ENUM('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
    estimated_hours SMALLINT UNSIGNED NOT NULL DEFAULT 10,
    deliverables    JSON NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_projects_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- project_skills — skills practiced per project (used for recommendation match)
-- ----------------------------------------------------------------------------
CREATE TABLE project_skills (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_id  INT UNSIGNED NOT NULL,
    skill_name  VARCHAR(100) NOT NULL,
    is_prerequisite BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_project_skills_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    UNIQUE KEY uq_project_skill (project_id, skill_name, is_prerequisite),
    INDEX idx_project_skills_project (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- activity_logs — append-only feed powering "Recent activity" + weekly chart
-- ----------------------------------------------------------------------------
CREATE TABLE activity_logs (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         INT UNSIGNED NOT NULL,
    activity_type   VARCHAR(60) NOT NULL,
    description     VARCHAR(255) NOT NULL,
    metadata        JSON DEFAULT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_activity_user_created (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

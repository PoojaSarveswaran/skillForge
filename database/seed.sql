-- ============================================================================
-- SkillForge AI — Seed Data
-- ============================================================================
-- Run with:  mysql -u <user> -p skillforge < database/seed.sql
-- Contains only reference/catalog data (roles, role skills, projects).
-- Demo account data is created by scripts/seedDemo.js via the real API so
-- password hashing and business logic are exercised end-to-end.
-- ============================================================================

SET NAMES utf8mb4;

-- ----------------------------------------------------------------------------
-- career_roles
-- ----------------------------------------------------------------------------
INSERT INTO career_roles (slug, title, category, icon, short_description, long_description, key_responsibilities, learning_sequence) VALUES
('full-stack-developer', 'Full-Stack Developer', 'Development', '💻',
 'Build complete web applications using frontend, backend, and databases.',
 'A Full-Stack Developer designs and ships entire web applications end to end — from the interface a user clicks on, through the API that serves data, down to the database that stores it. They move fluidly between client and server code and understand how each layer affects the others.',
 JSON_ARRAY('Build responsive user interfaces with React', 'Design and implement REST APIs', 'Model and query relational databases', 'Integrate frontend and backend systems', 'Debug issues across the full stack'),
 JSON_ARRAY('HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Express', 'SQL', 'MySQL', 'REST APIs', 'Git')),

('ai-ml-engineer', 'AI/ML Engineer', 'AI/ML', '🤖',
 'Work on machine learning pipelines and intelligent data-driven systems.',
 'An AI/ML Engineer designs, trains, and deploys machine learning models that solve real-world problems. The role blends strong programming fundamentals with statistics, data handling, and an understanding of how models behave once they leave the notebook.',
 JSON_ARRAY('Build and train machine learning models', 'Preprocess and analyze datasets', 'Evaluate model performance rigorously', 'Deploy models to production', 'Integrate ML outputs into applications'),
 JSON_ARRAY('Python', 'Mathematics', 'Statistics', 'Data Analysis', 'Machine Learning', 'Deep Learning', 'SQL', 'Data Visualization', 'Model Deployment')),

('data-analyst', 'Data Analyst', 'Data', '📈',
 'Analyze data, create insights, and build data-driven solutions.',
 'A Data Analyst turns raw data into decisions. They query databases, clean messy datasets, run statistical analysis, and present findings through dashboards and visualizations that stakeholders can act on.',
 JSON_ARRAY('Write SQL queries to extract and aggregate data', 'Clean and validate datasets', 'Perform statistical analysis', 'Build dashboards and visual reports', 'Communicate findings to stakeholders'),
 JSON_ARRAY('SQL', 'Excel', 'Statistics', 'Python', 'Data Cleaning', 'Data Visualization', 'Tableau', 'Critical Thinking')),

('software-engineer', 'Software Engineer', 'Development', '🧩',
 'Design scalable backend-side APIs and robust software systems.',
 'A Software Engineer builds reliable, maintainable software at scale. The role emphasizes computer science fundamentals — data structures, algorithms, and system design — combined with disciplined engineering practices like testing and version control.',
 JSON_ARRAY('Design efficient data structures and algorithms', 'Write and maintain automated tests', 'Design scalable system architecture', 'Collaborate using version control', 'Review code for correctness and quality'),
 JSON_ARRAY('Data Structures', 'Algorithms', 'OOP', 'Git', 'Java', 'Testing', 'SQL', 'System Design')),

('frontend-developer', 'Frontend Developer', 'Development', '🎨',
 'Create interfaces and interactive web experiences.',
 'A Frontend Developer builds everything a user sees and interacts with in the browser. They focus on responsive layouts, accessible markup, component architecture, and smooth interactivity.',
 JSON_ARRAY('Build responsive, accessible interfaces', 'Develop reusable React components', 'Optimize client-side performance', 'Write UI tests', 'Collaborate with designers on UX'),
 JSON_ARRAY('HTML', 'CSS', 'JavaScript', 'Responsive Design', 'React', 'Accessibility', 'Testing', 'Git')),

('backend-developer', 'Backend Developer', 'Development', '⚙️',
 'Build server-side APIs, databases, and application logic.',
 'A Backend Developer builds the systems that power an application behind the scenes — APIs, business logic, authentication, and the databases that store everything. Reliability, security, and clean API design are central to the role.',
 JSON_ARRAY('Design and build REST APIs', 'Model relational databases', 'Implement authentication and authorization', 'Write automated tests for business logic', 'Containerize and deploy services'),
 JSON_ARRAY('Node.js', 'Express', 'SQL', 'MySQL', 'API Design', 'Authentication', 'Testing', 'Docker'));

-- ----------------------------------------------------------------------------
-- role_skills
-- ----------------------------------------------------------------------------

-- Full-Stack Developer (role_id 1)
INSERT INTO role_skills (role_id, skill_name, category, target_proficiency, importance, prerequisite_skill_name) VALUES
(1, 'HTML', 'Frontend', 3, 'medium', NULL),
(1, 'CSS', 'Frontend', 3, 'medium', 'HTML'),
(1, 'JavaScript', 'Frontend', 4, 'critical', 'CSS'),
(1, 'React', 'Frontend', 4, 'critical', 'JavaScript'),
(1, 'Node.js', 'Backend', 4, 'critical', 'JavaScript'),
(1, 'Express', 'Backend', 3, 'high', 'Node.js'),
(1, 'SQL', 'Databases', 3, 'high', NULL),
(1, 'MySQL', 'Databases', 3, 'high', 'SQL'),
(1, 'REST APIs', 'Backend', 3, 'high', 'Express'),
(1, 'Git', 'Tools', 3, 'medium', NULL);

-- AI/ML Engineer (role_id 2)
INSERT INTO role_skills (role_id, skill_name, category, target_proficiency, importance, prerequisite_skill_name) VALUES
(2, 'Python', 'AI/ML', 4, 'critical', NULL),
(2, 'Mathematics', 'AI/ML', 3, 'high', NULL),
(2, 'Statistics', 'AI/ML', 3, 'high', 'Mathematics'),
(2, 'Data Analysis', 'AI/ML', 3, 'high', 'Python'),
(2, 'Machine Learning', 'AI/ML', 4, 'critical', 'Statistics'),
(2, 'Deep Learning', 'AI/ML', 3, 'medium', 'Machine Learning'),
(2, 'SQL', 'Databases', 2, 'medium', NULL),
(2, 'Data Visualization', 'AI/ML', 2, 'medium', 'Data Analysis'),
(2, 'Model Deployment', 'DevOps', 2, 'medium', 'Deep Learning');

-- Data Analyst (role_id 3)
INSERT INTO role_skills (role_id, skill_name, category, target_proficiency, importance, prerequisite_skill_name) VALUES
(3, 'SQL', 'Databases', 4, 'critical', NULL),
(3, 'Excel', 'Data', 3, 'medium', NULL),
(3, 'Statistics', 'Data', 3, 'high', NULL),
(3, 'Python', 'Data', 3, 'high', 'SQL'),
(3, 'Data Cleaning', 'Data', 3, 'high', 'SQL'),
(3, 'Data Visualization', 'Data', 4, 'critical', 'Python'),
(3, 'Tableau', 'Data', 3, 'medium', 'Data Visualization'),
(3, 'Critical Thinking', 'General', 2, 'low', NULL);

-- Software Engineer (role_id 4)
INSERT INTO role_skills (role_id, skill_name, category, target_proficiency, importance, prerequisite_skill_name) VALUES
(4, 'Data Structures', 'CS Fundamentals', 4, 'critical', NULL),
(4, 'Algorithms', 'CS Fundamentals', 4, 'critical', 'Data Structures'),
(4, 'OOP', 'CS Fundamentals', 3, 'high', NULL),
(4, 'Java', 'Backend', 3, 'high', 'OOP'),
(4, 'System Design', 'Architecture', 3, 'high', 'Algorithms'),
(4, 'Testing', 'Quality', 3, 'medium', 'OOP'),
(4, 'SQL', 'Databases', 3, 'medium', NULL),
(4, 'Git', 'Tools', 3, 'medium', NULL);

-- Frontend Developer (role_id 5)
INSERT INTO role_skills (role_id, skill_name, category, target_proficiency, importance, prerequisite_skill_name) VALUES
(5, 'HTML', 'Frontend', 4, 'critical', NULL),
(5, 'CSS', 'Frontend', 4, 'critical', 'HTML'),
(5, 'JavaScript', 'Frontend', 4, 'critical', 'CSS'),
(5, 'Responsive Design', 'Frontend', 3, 'high', 'CSS'),
(5, 'React', 'Frontend', 4, 'critical', 'JavaScript'),
(5, 'Accessibility', 'Frontend', 2, 'medium', 'HTML'),
(5, 'Testing', 'Quality', 2, 'medium', 'React'),
(5, 'Git', 'Tools', 2, 'low', NULL);

-- Backend Developer (role_id 6)
INSERT INTO role_skills (role_id, skill_name, category, target_proficiency, importance, prerequisite_skill_name) VALUES
(6, 'Node.js', 'Backend', 4, 'critical', NULL),
(6, 'Express', 'Backend', 3, 'high', 'Node.js'),
(6, 'SQL', 'Databases', 3, 'high', NULL),
(6, 'MySQL', 'Databases', 3, 'high', 'SQL'),
(6, 'API Design', 'Backend', 3, 'high', 'Express'),
(6, 'Authentication', 'Security', 3, 'medium', 'API Design'),
(6, 'Testing', 'Quality', 2, 'medium', 'Express'),
(6, 'Docker', 'DevOps', 2, 'medium', 'API Design');

-- ----------------------------------------------------------------------------
-- projects
-- ----------------------------------------------------------------------------
INSERT INTO projects (slug, title, description, difficulty, estimated_hours, deliverables) VALUES
('responsive-portfolio-website', 'Responsive Portfolio Website', 'Build a personal portfolio site with a responsive layout, project gallery, and contact form using semantic HTML, modern CSS, and vanilla JavaScript interactivity.', 'beginner', 12, JSON_ARRAY('Deployed static site', 'Responsive layout at 3 breakpoints', 'Accessible semantic markup')),
('rest-api-task-manager', 'REST API with Database Persistence', 'Design and build a task-management REST API backed by MySQL, with full CRUD endpoints, input validation, and parameterized queries.', 'intermediate', 18, JSON_ARRAY('Documented REST API', 'MySQL schema with migrations', 'Postman/curl test collection')),
('exploratory-data-analysis', 'Exploratory Data Analysis Project', 'Clean a real-world dataset, compute summary statistics, and produce a set of visualizations that surface meaningful trends.', 'beginner', 10, JSON_ARRAY('Cleaned dataset', 'Jupyter notebook with analysis', 'Visual summary report')),
('classification-model', 'Classification Model', 'Train and evaluate a classification model on a labeled dataset, tune hyperparameters, and report precision/recall/F1 metrics.', 'intermediate', 16, JSON_ARRAY('Trained model artifact', 'Evaluation report', 'Reproducible training script')),
('full-stack-task-manager', 'Full-Stack Task Manager', 'Build a complete task manager with a React frontend, Express REST API, and MySQL persistence, including authentication.', 'advanced', 30, JSON_ARRAY('Deployed full-stack app', 'Authenticated user flows', 'End-to-end CRUD across all layers')),
('sales-dashboard-tableau', 'Sales Analytics Dashboard', 'Clean a sales dataset with SQL, then build an interactive Tableau dashboard that highlights trends and outliers for stakeholders.', 'intermediate', 14, JSON_ARRAY('Cleaned SQL views', 'Interactive dashboard', 'Written insights summary')),
('image-classification-cnn', 'Image Classification with Deep Learning', 'Build and train a convolutional neural network to classify images, applying data augmentation and transfer learning.', 'advanced', 24, JSON_ARRAY('Trained CNN model', 'Training/validation accuracy report', 'Inference demo script')),
('algorithm-visualizer', 'Algorithm Visualizer', 'Implement core sorting and graph algorithms and visualize their execution step-by-step in the browser.', 'intermediate', 15, JSON_ARRAY('Working visualizer app', 'Implementations of 5+ algorithms', 'Complexity analysis writeup')),
('chatbot-nlp', 'Conversational Chatbot with NLP', 'Build a chatbot that uses NLP techniques for intent recognition and generates contextual responses.', 'advanced', 22, JSON_ARRAY('Working chatbot demo', 'Intent classification model', 'Conversation logs and evaluation')),
('accessible-component-library', 'Accessible React Component Library', 'Build a small library of accessible, tested, reusable React components (buttons, modals, forms) following WCAG guidelines.', 'intermediate', 16, JSON_ARRAY('Published component library', 'Automated accessibility tests', 'Usage documentation'));

-- ----------------------------------------------------------------------------
-- project_skills
-- ----------------------------------------------------------------------------
INSERT INTO project_skills (project_id, skill_name, is_prerequisite) VALUES
(1, 'HTML', FALSE), (1, 'CSS', FALSE), (1, 'JavaScript', FALSE),

(2, 'Node.js', FALSE), (2, 'Express', FALSE), (2, 'MySQL', FALSE), (2, 'REST APIs', FALSE), (2, 'JavaScript', TRUE),

(3, 'Python', TRUE), (3, 'Data Analysis', FALSE), (3, 'Data Visualization', FALSE), (3, 'Statistics', FALSE),

(4, 'Python', TRUE), (4, 'Machine Learning', FALSE), (4, 'Statistics', FALSE),

(5, 'React', FALSE), (5, 'Node.js', FALSE), (5, 'Express', FALSE), (5, 'MySQL', FALSE), (5, 'REST APIs', FALSE),

(6, 'SQL', FALSE), (6, 'Tableau', FALSE), (6, 'Data Visualization', FALSE), (6, 'Data Cleaning', FALSE),

(7, 'Python', TRUE), (7, 'Deep Learning', FALSE), (7, 'Machine Learning', TRUE),

(8, 'Data Structures', FALSE), (8, 'Algorithms', FALSE), (8, 'JavaScript', FALSE),

(9, 'Python', TRUE), (9, 'Machine Learning', FALSE), (9, 'Deep Learning', FALSE), (9, 'Data Analysis', FALSE),

(10, 'React', TRUE), (10, 'Accessibility', FALSE), (10, 'Testing', FALSE), (10, 'CSS', FALSE);

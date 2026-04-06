🏥 Smart Hospital Queue & Bed Manager
Product Requirements Document (PRD)
________________________________________
1. Executive Summary
The Smart Hospital Queue & Bed Manager is a real-time digital platform designed to optimize patient flow and hospital resource utilization. It addresses critical inefficiencies in traditional hospital systems such as long waiting times, unmanaged queues, and lack of real-time bed visibility.
The system provides:
•	Seamless appointment booking for patients 
•	Live queue management for doctors 
•	Centralized bed tracking for administrators 
This results in improved operational efficiency, enhanced patient experience, and faster clinical decision-making.
________________________________________
2. Problem Statement
Hospitals today face the following operational challenges:
•	Overcrowded waiting areas due to manual queue handling 
•	Lack of transparency in patient wait times 
•	Inefficient coordination between departments 
•	Delayed admissions due to poor bed visibility 
•	Increased workload on front-desk staff 
These issues directly impact patient satisfaction and hospital efficiency.
________________________________________
3. Product Vision
To build a real-time, scalable, and user-centric hospital management system that eliminates waiting inefficiencies and enables data-driven operational control.
________________________________________
4. Goals & Objectives
Primary Goals
•	Reduce patient wait time by ≥ 50% 
•	Improve bed utilization efficiency by ≥ 30% 
•	Enable real-time visibility across hospital operations 
Secondary Goals
•	Reduce manual workload for hospital staff 
•	Improve patient satisfaction and transparency 
•	Enable faster emergency response handling 
________________________________________
5. Scope Definition
In Scope (MVP)
•	Role-based authentication (Patient, Doctor, Admin) 
•	Appointment scheduling system 
•	Real-time queue tracking 
•	Doctor consultation workflow 
•	Bed availability management 
Out of Scope (Post-MVP)
•	Payment gateway integration 
•	Electronic Health Records (EHR) 
•	AI-based prediction models 
•	Multi-hospital networking 
________________________________________
6. Stakeholders
Stakeholder	Responsibility
Patients	Book and track appointments
Doctors	Manage consultation queue
Hospital Admin	Monitor beds and operations
Development Team	Build and deploy system
Hackathon Judges	Evaluate usability & impact
________________________________________
7. User Personas
Patient Persona
•	Needs quick appointment booking 
•	Wants transparency in waiting time 
•	Prefers mobile-friendly interface 
Doctor Persona
•	Needs structured patient flow 
•	Requires quick access to queue data 
•	Wants minimal administrative overhead 
Admin Persona
•	Needs real-time operational dashboard 
•	Requires bed allocation control 
•	Handles emergency situations 
________________________________________
8. Functional Requirements
8.1 Authentication & Authorization
•	Secure login using JWT 
•	Role-based access control (RBAC) 
•	Password encryption 
________________________________________
8.2 Appointment Booking System
•	View doctor availability 
•	Select time slots 
•	Generate unique digital token 
•	Prevent overbooking 
________________________________________
8.3 Queue Management System
•	FIFO-based queue logic 
•	Real-time queue updates using WebSockets 
•	Display: 
o	Current token 
o	Patient position 
o	Estimated wait time 
________________________________________
8.4 Doctor Dashboard
•	View scheduled appointments 
•	Access patient queue 
•	Mark consultation as completed 
•	Automatically update queue 
________________________________________
8.5 Bed Management System
•	Bed categorization: 
o	ICU 
o	General Ward 
o	Emergency 
•	Track bed status: 
o	Available 
o	Occupied 
o	Reserved 
•	Assign bed to patient 
•	Discharge and free bed 
________________________________________
9. Non-Functional Requirements
Category	Requirement
Performance	API response < 2 seconds
Scalability	Support 1000+ concurrent users
Security	JWT authentication, hashed passwords
Availability	99% uptime
Usability	Mobile-first responsive design
________________________________________
10. System Architecture
Architecture Style
•	Client-Server Architecture 
•	REST APIs + WebSockets 
High-Level Components
•	Frontend (React.js) 
•	Backend (Node.js + Express) 
•	Database (MongoDB) 
•	Real-time Engine (Socket.IO) 
________________________________________
11. Data Model (High-Level)
Users
•	id 
•	name 
•	email 
•	password 
•	role 
Doctors
•	id 
•	department 
•	available_slots 
Appointments
•	id 
•	patient_id 
•	doctor_id 
•	time_slot 
•	token_number 
•	status 
Beds
•	id 
•	type 
•	status 
•	patient_id 
________________________________________
12. User Journeys
Patient Journey
1.	Register/Login 
2.	Browse doctors 
3.	Book appointment 
4.	Receive token 
5.	Track queue in real time 
________________________________________
Doctor Journey
1.	Login 
2.	View queue dashboard 
3.	Call next patient 
4.	Complete consultation 
________________________________________
Admin Journey
1.	Login 
2.	Monitor bed dashboard 
3.	Assign bed 
4.	Discharge patient 
________________________________________
13. API Design (Sample)
Auth APIs
•	POST /api/auth/register 
•	POST /api/auth/login 
Appointment APIs
•	POST /api/appointments/book 
•	GET /api/appointments/doctor/:id 
Queue APIs
•	GET /api/queue/:doctorId 
Bed APIs
•	GET /api/beds 
•	POST /api/beds/assign 
•	POST /api/beds/discharge 
________________________________________
14. Real-Time Events (Socket.IO)
•	queue:update → Broadcast queue changes 
•	appointment:new → New booking 
•	bed:update → Bed status change

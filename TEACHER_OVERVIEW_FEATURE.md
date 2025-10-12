# Teacher Overview Feature Documentation

## Overview
This document outlines the Teacher Overview feature that has been implemented in the SpeedUpTutorial application. This feature provides administrators with detailed statistics and information about each teacher, accessible directly from the Teachers management page.

## Features

### 1. Teacher Overview Button
- A "View Overview" button has been added to each teacher card in the Teachers management page
- Clicking this button navigates to the dedicated Teacher Overview page for that specific teacher
- The button is styled with an orange gradient to visually distinguish it from the "View Details" button

### 2. Teacher Overview Page
- Located at `/admin/teacher/{id}/overview`
- Shows detailed statistics and upcoming classes for the selected teacher
- Includes a dropdown to easily switch between different teachers
- Displays the current date for reference

### 3. Statistics Display
The Teacher Overview page displays key statistics for each teacher:
- **Total Students**: Number of unique students assigned to the teacher
- **Total Classes**: Total number of classes the teacher has been assigned
- **Upcoming Classes**: Number of scheduled classes that have not yet occurred
- **Total Absences**: Number of absences recorded for the teacher

### 4. Upcoming Classes Section
- Lists the next 5 upcoming classes for the selected teacher
- Each class entry shows:
  - Student name
  - Class type
  - Date and time of the class
- If no upcoming classes are found, a message is displayed

## Technical Implementation

### Frontend Components
- `TeacherOverview.jsx`: Main component for the teacher overview page
- Modified `Teachers.jsx`: Added the "View Overview" button to each teacher card

### Backend Support
- `User.php`: Contains `getTeacherClasses()` and `getTeacherDashboardStats()` methods
- `DashboardController.php`: Includes `getTeacherStats()` method to provide statistics
- Route defined in `web.php`: `/admin/teacher/{id}/overview`

### API Endpoints
- `/api/admin/dashboard/stats/teacher/{teacherId}`: Returns teacher statistics
- `/api/admin/teachers/{id}/classes`: Returns teacher classes with stats

## How to Use
1. Navigate to the Teachers management page
2. Find the teacher you want to view
3. Click the "View Overview" button (orange gradient button)
4. View the teacher's statistics and upcoming classes
5. Use the dropdown at the top to switch between teachers

## Best Practices
- Use the Teacher Overview to quickly assess a teacher's workload
- Monitor the number of upcoming classes to ensure balanced scheduling
- Check absence statistics to identify potential attendance issues
- Use the teacher dropdown to efficiently compare statistics between teachers
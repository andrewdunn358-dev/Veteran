#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: |
  Build a mobile-first web application MVP for UK military veterans focused on immediate mental health 
  and suicide crisis support. Zero friction access to help in 1-2 taps.

backend:
  - task: "Peer support registration API endpoint"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Created POST /api/peer-support/register endpoint to store veteran emails for peer support programme. Includes email validation and duplicate checking."
      - working: true
        agent: "testing"
        comment: "✅ BACKEND TESTING COMPLETE: POST /api/peer-support/register working perfectly. Tested valid email registration (returns 200 with id/email/timestamp), invalid email format validation (returns 422), duplicate email handling (returns 400 with user-friendly message), empty email rejection (returns 422). All responses include proper HTTP status codes and JSON format. MongoDB storage verified - all test registrations successfully stored and retrievable."

  - task: "Get peer support registrations endpoint"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "low"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Created GET /api/peer-support/registrations endpoint for admin to view all registrations."
      - working: true
        agent: "testing"
        comment: "✅ BACKEND TESTING COMPLETE: GET /api/peer-support/registrations working perfectly. Returns array of registrations sorted by timestamp (newest first). Proper JSON response format with all required fields (id, email, timestamp). Successfully retrieves all stored registrations from MongoDB. Status code 200 with correct headers."

frontend:
  - task: "Home screen with crisis support navigation"
    implemented: true
    working: "NA"
    file: "/app/frontend/app/index.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Created home screen with large red 'I NEED HELP NOW' button, secondary buttons for peer support and organizations, emergency 999 notice always visible. Dark calming theme with veterans badge."

  - task: "Crisis support options page"
    implemented: true
    working: "NA"
    file: "/app/frontend/app/crisis-support.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Created crisis support page with 3 UK crisis services (Combat Stress, Samaritans, Veterans UK). Each has Call/SMS/WhatsApp buttons using deep links. Emergency 999 banner at top."

  - task: "Support organizations directory"
    implemented: true
    working: "NA"
    file: "/app/frontend/app/organizations.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Created organizations page listing 8 UK veteran support services (Combat Stress, Samaritans, Veterans UK, CALM, NHS, SSAFA, Help for Heroes, Royal British Legion). Each has human-readable description and click-to-call/SMS/WhatsApp buttons."

  - task: "Peer support registration page"
    implemented: true
    working: "NA"
    file: "/app/frontend/app/peer-support.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Created peer support page explaining what peer support is/isn't. Includes registration form for veterans to sign up to give peer support. Email validation and backend integration included."

  - task: "Navigation layout setup"
    implemented: true
    working: "NA"
    file: "/app/frontend/app/_layout.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Created Stack navigation layout with slide animations and consistent dark theme across all screens."

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 0
  run_ui: false

test_plan:
  current_focus:
    - "Peer support registration API endpoint"
    - "Home screen with crisis support navigation"
    - "Crisis support options page"
    - "Support organizations directory"
    - "Peer support registration page"
  stuck_tasks: []
  test_all: true
  test_priority: "high_first"

agent_communication:
  - agent: "main"
    message: |
      Initial MVP implementation complete. All core features implemented:
      
      Backend:
      - Peer support registration endpoint with email validation
      - MongoDB storage for registrations
      
      Frontend:
      - Home screen with large red "I NEED HELP NOW" button
      - Crisis support page with UK services (Call/SMS/WhatsApp deep links)
      - Organizations directory with 8 UK veteran support services
      - Peer support page with registration form
      - Dark calming theme (navy blue) with veterans shield badge
      - All navigation uses stack-based routing
      
      Ready for backend testing. Need to verify:
      1. API endpoints respond correctly
      2. Email validation works
      3. MongoDB stores registrations properly
      4. Duplicate email handling works
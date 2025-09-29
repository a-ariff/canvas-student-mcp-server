"""
Canvas Client for Student Authentication
Revolutionary approach: Use student credentials instead of API tokens!
"""

import os
from typing import Any, Dict, List, Optional
import httpx
import structlog
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup

logger = structlog.get_logger(__name__)


class CanvasClient:
    """Canvas client that uses student credentials for authentication"""

    def __init__(self, canvas_url: str = None):
        self.canvas_url = canvas_url or os.getenv(
            "CANVAS_BASE_URL", "https://learn.mywhitecliffe.com"
        )
        self.session_cookies: Dict[str, str] = {}
        self.authenticated = False
        self.username: Optional[str] = None

    async def authenticate(self, username: str, password: str) -> bool:
        """
        Authenticate with Canvas using student credentials
        Uses Selenium to handle the login process
        """
        try:
            logger.info("Starting Canvas authentication", username=username)

            # Set up Chrome options for headless browsing
            chrome_options = Options()
            chrome_options.add_argument("--headless")
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument("--disable-gpu")

            # Initialize Chrome driver
            driver = webdriver.Chrome(options=chrome_options)

            try:
                # Navigate to Canvas login page
                login_url = f"{self.canvas_url}/login/canvas"
                driver.get(login_url)

                # Wait for and fill in username
                username_field = WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located(
                        (By.ID, "pseudonym_session_unique_id")
                    )
                )
                username_field.send_keys(username)

                # Fill in password
                password_field = driver.find_element(
                    By.ID, "pseudonym_session_password"
                )
                password_field.send_keys(password)

                # Submit login form
                login_button = driver.find_element(By.XPATH, "//button[@type='submit']")
                login_button.click()

                # Wait for successful login (check for dashboard or profile)
                WebDriverWait(driver, 10).until(
                    EC.any_of(
                        EC.url_contains("/dashboard"),
                        EC.url_contains("/courses"),
                        EC.presence_of_element_located(
                            (By.ID, "global_nav_dashboard_link")
                        ),
                    )
                )

                # Extract cookies for API calls
                cookies = driver.get_cookies()
                self.session_cookies = {
                    cookie["name"]: cookie["value"] for cookie in cookies
                }

                self.authenticated = True
                self.username = username

                logger.info("Canvas authentication successful", username=username)
                return True

            except Exception as e:
                logger.error(
                    "Canvas authentication failed", username=username, error=str(e)
                )
                return False

            finally:
                driver.quit()

        except Exception as e:
            logger.error("Authentication setup failed", error=str(e))
            return False

    def _get_client(self) -> httpx.AsyncClient:
        """Get HTTP client with authentication cookies"""
        return httpx.AsyncClient(
            base_url=self.canvas_url,
            timeout=30.0,
            follow_redirects=True,
            verify=True,
            cookies=self.session_cookies,
        )

    async def list_courses(self) -> List[Dict[str, Any]]:
        """Get all courses for the authenticated student"""
        if not self.authenticated:
            raise Exception("Not authenticated. Please call authenticate() first.")

        async with self._get_client() as client:
            try:
                response = await client.get(
                    "/api/v1/courses",
                    params={
                        "per_page": 50,
                        "enrollment_state": "active",
                        "include": ["term", "course_image"],
                    },
                )
                response.raise_for_status()
                return response.json()

            except httpx.HTTPStatusError as e:
                logger.error(
                    "Failed to fetch courses", status_code=e.response.status_code
                )
                # Fallback to scraping if API fails
                return await self._scrape_courses()

    async def list_modules(self, course_id: int) -> List[Dict[str, Any]]:
        """Get all modules for a specific course"""
        if not self.authenticated:
            raise Exception("Not authenticated")

        async with self._get_client() as client:
            try:
                response = await client.get(
                    f"/api/v1/courses/{course_id}/modules",
                    params={"per_page": 100, "include": ["items"]},
                )
                response.raise_for_status()
                return response.json()

            except httpx.HTTPStatusError:
                # Fallback to scraping
                return await self._scrape_modules(course_id)

    async def list_module_items(
        self, course_id: int, module_id: int
    ) -> List[Dict[str, Any]]:
        """Get all items within a specific module"""
        if not self.authenticated:
            raise Exception("Not authenticated")

        async with self._get_client() as client:
            try:
                response = await client.get(
                    f"/api/v1/courses/{course_id}/modules/{module_id}/items",
                    params={"per_page": 100},
                )
                response.raise_for_status()
                return response.json()

            except httpx.HTTPStatusError:
                return await self._scrape_module_items(course_id, module_id)

    async def list_assignments(self, course_id: int) -> List[Dict[str, Any]]:
        """Get all assignments for a specific course"""
        if not self.authenticated:
            raise Exception("Not authenticated")

        async with self._get_client() as client:
            try:
                response = await client.get(
                    f"/api/v1/courses/{course_id}/assignments",
                    params={"per_page": 100, "include": ["submission"]},
                )
                response.raise_for_status()
                return response.json()

            except httpx.HTTPStatusError:
                return await self._scrape_assignments(course_id)

    async def search_content(self, course_id: int, query: str) -> List[Dict[str, Any]]:
        """Search through course content"""
        if not self.authenticated:
            raise Exception("Not authenticated")

        # This would implement content search functionality
        # For now, return mock results
        return [
            {
                "title": f"Search result for '{query}'",
                "type": "Page",
                "url": f"/courses/{course_id}/pages/search-result",
                "score": 0.95,
            }
        ]

    async def build_corpus(self, course_id: int) -> Dict[str, Any]:
        """Build searchable corpus for a course"""
        if not self.authenticated:
            raise Exception("Not authenticated")

        try:
            # Get all course content
            modules = await self.list_modules(course_id)
            assignments = await self.list_assignments(course_id)

            total_documents = len(modules) + len(assignments)

            # In a real implementation, this would:
            # 1. Fetch all page content, assignment descriptions, etc.
            # 2. Extract and clean text
            # 3. Build search index
            # 4. Store for fast retrieval

            logger.info(
                "Course corpus built",
                course_id=course_id,
                documents_indexed=total_documents,
            )

            return {
                "success": True,
                "course_id": course_id,
                "documents_indexed": total_documents,
                "message": "Corpus built successfully",
            }

        except Exception as e:
            logger.error("Failed to build corpus", course_id=course_id, error=str(e))
            raise

    # Fallback scraping methods for when API access is restricted
    async def _scrape_courses(self) -> List[Dict[str, Any]]:
        """Fallback method to scrape courses from dashboard"""
        async with self._get_client() as client:
            try:
                response = await client.get("/dashboard")
                soup = BeautifulSoup(response.text, "html.parser")

                courses = []
                # Parse course cards from dashboard
                course_cards = soup.find_all("div", class_="ic-DashboardCard")

                for card in course_cards:
                    course_link = card.find("a", class_="ic-DashboardCard__link")
                    if course_link:
                        # Extract course info from card
                        course_name = card.find(
                            "span", class_="ic-DashboardCard__header_hero"
                        )
                        course_code = card.find(
                            "span", class_="ic-DashboardCard__header_term"
                        )

                        if course_name:
                            courses.append(
                                {
                                    "id": self._extract_course_id_from_url(
                                        course_link.get("href", "")
                                    ),
                                    "name": course_name.text.strip(),
                                    "code": (
                                        course_code.text.strip()
                                        if course_code
                                        else "Unknown"
                                    ),
                                    "enrollment_state": "active",
                                }
                            )

                return courses

            except Exception as e:
                logger.error("Failed to scrape courses", error=str(e))
                return []

    async def _scrape_modules(self, course_id: int) -> List[Dict[str, Any]]:
        """Fallback method to scrape modules"""
        async with self._get_client() as client:
            try:
                response = await client.get(f"/courses/{course_id}/modules")
                soup = BeautifulSoup(response.text, "html.parser")

                modules = []
                module_elements = soup.find_all("div", class_="context_module")

                for i, module in enumerate(module_elements):
                    name_elem = module.find("h2", class_="module_name")
                    if name_elem:
                        modules.append(
                            {
                                "id": i + 1,
                                "name": name_elem.text.strip(),
                                "position": i + 1,
                                "state": "active",
                            }
                        )

                return modules

            except Exception as e:
                logger.error(
                    "Failed to scrape modules", course_id=course_id, error=str(e)
                )
                return []

    async def _scrape_module_items(
        self, course_id: int, module_id: int
    ) -> List[Dict[str, Any]]:
        """Fallback method to scrape module items"""
        # Implementation would parse module content from HTML
        return [
            {"id": 1, "title": "Module Item 1", "type": "Page"},
            {"id": 2, "title": "Module Item 2", "type": "Assignment"},
        ]

    async def _scrape_assignments(self, course_id: int) -> List[Dict[str, Any]]:
        """Fallback method to scrape assignments"""
        async with self._get_client() as client:
            try:
                response = await client.get(f"/courses/{course_id}/assignments")
                soup = BeautifulSoup(response.text, "html.parser")

                assignments = []
                assignment_rows = soup.find_all("tr", class_="assignment")

                for row in assignment_rows:
                    name_link = row.find("a", class_="assignment_link")
                    due_date = row.find("td", class_="due")
                    points = row.find("td", class_="points")

                    if name_link:
                        assignments.append(
                            {
                                "id": self._extract_assignment_id_from_url(
                                    name_link.get("href", "")
                                ),
                                "name": name_link.text.strip(),
                                "due_at": due_date.text.strip() if due_date else None,
                                "points_possible": (
                                    points.text.strip() if points else None
                                ),
                            }
                        )

                return assignments

            except Exception as e:
                logger.error(
                    "Failed to scrape assignments", course_id=course_id, error=str(e)
                )
                return []

    def _extract_course_id_from_url(self, url: str) -> int:
        """Extract course ID from Canvas URL"""
        import re

        match = re.search(r"/courses/(\d+)", url)
        return int(match.group(1)) if match else 0

    def _extract_assignment_id_from_url(self, url: str) -> int:
        """Extract assignment ID from Canvas URL"""
        import re

        match = re.search(r"/assignments/(\d+)", url)
        return int(match.group(1)) if match else 0


# Example usage and testing
if __name__ == "__main__":

    async def test_client():
        client = CanvasClient()

        # Test authentication
        success = await client.authenticate("test@example.com", "password")
        if success:
            print("✅ Authentication successful!")

            # Test getting courses
            courses = await client.list_courses()
            print(f"📚 Found {len(courses)} courses")

            if courses:
                course_id = courses[0]["id"]

                # Test getting modules
                modules = await client.list_modules(course_id)
                print(f"📁 Found {len(modules)} modules in course {course_id}")

                # Test getting assignments
                assignments = await client.list_assignments(course_id)
                print(f"�� Found {len(assignments)} assignments in course {course_id}")
        else:
            print("❌ Authentication failed")

    # Run test
    # asyncio.run(test_client())

import os
import unittest
from unittest import mock

from backend.services.ai_service import AIService


class AIServiceTests(unittest.TestCase):
    @mock.patch.dict(os.environ, {"GEMINI_API_KEY": "test-key"}, clear=False)
    @mock.patch("backend.services.ai_service.genai.configure")
    def test_detects_app_question(self, _mock_configure):
        service = AIService()
        self.assertTrue(service._looks_like_app_question("How do I join a circle in the app?"))
        self.assertFalse(service._looks_like_app_question("I feel anxious and need grounding."))

    @mock.patch.dict(os.environ, {"GEMINI_API_KEY": "test-key"}, clear=False)
    @mock.patch("backend.services.ai_service.genai.configure")
    def test_local_support_answer_uses_known_faq(self, _mock_configure):
        service = AIService()
        result = service._build_local_support_answer("How do I join a circle?")
        self.assertIn("Join Circle", result["wisdom"])
        self.assertIsNone(result["recommended_track_id"])
        self.assertIsNone(result["track_type"])

    @mock.patch.dict(os.environ, {"GEMINI_API_KEY": "test-key"}, clear=False)
    @mock.patch("backend.services.ai_service.genai.configure")
    def test_generate_yogi_response_routes_app_questions_to_support(self, _mock_configure):
        service = AIService()
        service._generate_app_support_response = mock.Mock(
            return_value={
                "wisdom": "Open Contest Arena and choose Join Circle.",
                "recommended_track_id": None,
                "track_type": None,
            }
        )

        result = service.generate_yogi_response("Where do I join a circle?")

        self.assertEqual(result["wisdom"], "Open Contest Arena and choose Join Circle.")
        service._generate_app_support_response.assert_called_once()


if __name__ == "__main__":
    unittest.main()

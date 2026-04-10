from .ai.orchestrator import AIOrchestrator

# For backward compatibility with existing routers
class AIService(AIOrchestrator):
    def generate_yogi_response(self, message: str, history: list = None) -> dict:
        return self.ask_yogi(message, history=history)

    def generate_daily_mantra(self, user_context: str) -> dict:
        return self.get_mantra(user_context)

    def generate_vedic_search(self, request_message: str, history: list = None) -> dict:
        return self.search_vedic(request_message, history=history)

    def generate_journey_summary(self, stats: dict) -> dict:
        return self.get_journey_reflection(stats)

ai_service = AIService()

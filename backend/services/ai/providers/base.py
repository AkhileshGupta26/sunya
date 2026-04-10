from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

class AIProvider(ABC):
    @abstractmethod
    def generate_json(self, prompt: str, history: Optional[List[Dict[str, str]]] = None, **kwargs) -> Dict[str, Any]:
        """Generate a JSON response from the AI provider."""
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """Check if the provider is configured and available."""
        pass

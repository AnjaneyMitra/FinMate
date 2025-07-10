import google.generativeai as genai

# Use the API key directly
api_key = "AIzaSyCMACw5UE2SlFEsypUoPzmc0YuVUnw4VYU"
genai.configure(api_key=api_key)

model_name = "models/gemini-2.5-pro-preview-06-05"

print(f"Available Models (showing only {model_name} if available):")
for m in genai.list_models():
    if m.name == model_name and hasattr(m, 'supported_generation_methods') and 'generateContent' in m.supported_generation_methods:
        print(f"- {m.name}")
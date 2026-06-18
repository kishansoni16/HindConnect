import os
from google import genai

try:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path="../server/.env")
except ImportError:
    pass

api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    print("Warning: GEMINI_API_KEY environment variable not found.")

client = genai.Client(api_key=api_key)

print("Gemini Chatbot Started!")
print("Type exit to stop\n")

chat = client.chats.create(
    model="gemini-2.5-flash"
)

while True:
    user_input = input("You: ")

    if user_input.lower() == "exit":
        break

    try:
        response = chat.send_message(user_input)

        print("Bot:", response.text)

    except Exception as e:
        print("Error:", e)
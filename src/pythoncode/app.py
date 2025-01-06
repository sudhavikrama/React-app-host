from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)

# MongoDB setup
client = MongoClient("mongodb://localhost:27017/")
db = client['chatbot_db']
chat_collection = db['chat_history']

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message')

    # Example bot logic (replace with your logic)
    bot_response = f"{user_message}"

    # Store conversation in MongoDB
    chat_collection.insert_one({'user': user_message, 'bot': bot_response})

    return jsonify({'response': bot_response})

if __name__ == '__main__':
    app.run(debug=True)



# from flask import Flask, request, jsonify
# from flask_cors import CORS  # To handle CORS issues
# from pymongo import MongoClient

# app = Flask(__name__)
# CORS(app)  # Enable CORS for all routes

# # Connect to MongoDB (update with your connection string)
# client = MongoClient("mongodb://localhost:27017/")
# db = client['chatbot_db']  # Replace with your database name
# chat_collection = db['chat_history']  # Collection for storing chat logs

# @app.route('/chat', methods=['POST'])
# def chat():
#     data = request.json
#     user_message = data.get('message')
    
#     # Here, you would implement your chatbot logic
#     bot_response = generate_bot_response(user_message)  # Replace with your logic

#     # Store the conversation in MongoDB
#     chat_collection.insert_one({'user': user_message, 'bot': bot_response})

#     return jsonify({'response': bot_response})

# @app.route('/chats', methods=['GET'])
# def get_chat_history():
#     # Fetch chat history from MongoDB
#     chat_history = list(chat_collection.find({}, {'_id': 0}))  # Exclude MongoDB _id field
#     return jsonify(chat_history)

# def generate_bot_response(message):
#     # Implement your bot's response logic here
#     # This is a placeholder for your bot logic
#     return f"Echo: {message}"  # Replace this with actual logic

# if __name__ == '__main__':
#     app.run(debug=True)



# # from flask import Flask, request, jsonify
# # from flask_cors import CORS

# # app = Flask(__name__)
# # CORS(app)  # Enable CORS

# # @app.route('/chat', methods=['POST'])
# # def chat():
# #     user_message = request.json.get('message')
# #     # Simple response logic (you can improve this)
# #     response_message = f"{user_message}"
# #     return jsonify({'response': response_message})

# # if __name__ == '__main__':
# #     app.run(debug=True)
# # from flask import Flask, request, jsonify
# # from flask_cors import CORS
# # from pymongo import MongoClient

# # app = Flask(__name__)
# # CORS(app)

# # # MongoDB connection
# # client = MongoClient("mongodb://localhost:27017/")
# # db = client['chatbot_db']  # Database name
# # chat_collection = db['chats']  # Collection name

# # @app.route('/chat', methods=['POST'])
# # def chat():
# #     user_message = request.json.get('message')
    
# #     # Create a bot response (for demonstration)
# #     bot_response = f"You said: {user_message}"

# #     # Store the chat message in MongoDB
# #     chat_entry = {
# #         'user_message': user_message,
# #         'bot_response': bot_response
# #     }
# #     chat_collection.insert_one(chat_entry)

# #     return jsonify({'response': bot_response})

# # @app.route('/chats', methods=['GET'])
# # def get_chats():
# #     chats = list(chat_collection.find({}, {'_id': 0}))  # Exclude MongoDB ObjectId
# #     return jsonify(chats)

# # if __name__ == '__main__':
# #     app.run(debug=True)

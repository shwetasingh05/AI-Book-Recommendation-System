from flask import Flask, request, jsonify
from flask_cors import CORS
from model import recommend_hybrid, get_book_details

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route("/")
def home():
    return "AI Book Recommendation System is running!"
    
@app.route("/recommend", methods=["GET"])
def recommend():
    book = request.args.get("book")
    results = recommend_hybrid(book)
    return jsonify(results)

@app.route("/book_details", methods=["GET"])
def book_details():
    title = request.args.get("title")
    if not title:
        return jsonify({"error": "Title parameter is required"}), 400
    details = get_book_details(title)
    if not details:
        return jsonify({"error": "Book not found"}), 404
    return jsonify(details)
    
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)

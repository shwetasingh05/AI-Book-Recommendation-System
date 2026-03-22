# 📚 AI Book Recommendation System

An AI-powered Book Recommendation System built using Python (Flask) and Natural Language Processing (NLP). The system recommends books based on content similarity using a trained model on a book dataset.

## 🚀 Features

- Content-based book recommendation  
- NLP using TF-IDF and Cosine Similarity  
- Full-stack web application (Flask + JavaScript)  
- Interactive UI with dynamic book cards  
- Recommendations enhanced using ratings and popularity  
- Detailed book view with metadata  

## 🧠 How It Works

The model is trained on a dataset containing book titles, authors, categories, and descriptions.  
Using TF-IDF vectorization, the system converts text into numerical form and computes similarity using Cosine Similarity to recommend relevant books.

## 🛠️ Tech Stack

- Python  
- Flask  
- Pandas  
- Scikit-learn  
- HTML, CSS, JavaScript  
- Google Books API  

## ⚙️ Installation & Setup

1. Clone the repository  
git clone https://github.com/shwetasingh05/AI-Book-Recommendation-System.git  

2. Navigate to the project folder  
cd AI-Book-Recommendation-System  

3. Install dependencies  
pip install -r requirements.txt  

4. Run the application  
python app.py  

5. Open in browser  
http://127.0.0.1:5000  


## 📂 Project Structure

AI-Book-Recommendation-System/  
│── app.py  
│── model.py   
│── dataset/  
│     ├── BOOKS.xlsx
│     └── clean_books_dataset.csv  
│── frontend/ 
│     ├── assests/
│       └──books.json
│     ├── index.html  
│     ├── script.js  
│     ├── style.css 
│     └── book.html 
│── requirements.txt

## 🎯 Future Improvements

- Add collaborative filtering  
- Deploy the application online  
- Improve recommendation accuracy  
- Add user personalization  


## 💡 Author

Shweta Singh  
B.Tech CSE 

## ⭐ If you like this project, give it a star!

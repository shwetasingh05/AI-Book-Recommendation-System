import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

df = pd.read_csv("clean_books_dataset.csv")

df['features'] = df['title'] + " " + df['authors'] + " " + df['categories'] + " " + df['description']
df['features'] = df['features'].str.lower()

tfidf = TfidfVectorizer(stop_words='english')
tfidf_matrix = tfidf.fit_transform(df['features'])

similarity_matrix = cosine_similarity(tfidf_matrix)

df['popularity_score'] = df['average_rating'] * np.log(df['ratings_count'] + 1)

def recommend_hybrid(book_title, n=5):

    book_title = book_title.lower()

    matches = df[df['title'].str.contains(book_title, case=False, na=False)]

    if matches.empty:
        return ["Book not found"]

    index = matches.index[0]

    similarity_scores = list(enumerate(similarity_matrix[index]))
    similarity_scores = sorted(similarity_scores, key=lambda x: x[1], reverse=True)

    similar_books_index = [i[0] for i in similarity_scores[1:50]]

    similar_books = df.iloc[similar_books_index]

    ranked_books = similar_books.sort_values(by='popularity_score', ascending=False)

    results = ranked_books.head(n)['title'].tolist()

    return results

books_df = None

def get_book_details(book_title):
    global books_df
    if books_df is None:
        books_df = pd.read_excel("BOOKS.xlsx")
    
    book_title = book_title.lower()
    matches = books_df[books_df['title'].str.lower() == book_title]
    if matches.empty:
        matches = books_df[books_df['title'].str.lower().str.contains(book_title, na=False, regex=False)]
        
    if matches.empty:
        return {}
        
    book_data = matches.iloc[0].fillna("").to_dict()
    
    # Convert any non-serializable pandas/numpy objects to standard python types
    for key, value in book_data.items():
        if pd.isna(value):
            book_data[key] = None
        elif isinstance(value, pd.Timestamp):
            book_data[key] = value.isoformat()
        elif isinstance(value, (np.int64, np.int32)):
            book_data[key] = int(value)
        elif isinstance(value, (np.float64, np.float32)):
            book_data[key] = float(value)
            
    return book_data
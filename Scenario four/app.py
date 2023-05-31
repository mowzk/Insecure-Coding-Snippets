import pickle
import base64
from flask import Flask, request

app = Flask(__name__)

@app.route('/')
def hello():
    return 'Hello, World!'

@app.route("/pickle", methods=["POST"])
def pickled():
    data = base64.urlsafe_b64decode(request.form['payload'])
    deserialized = pickle.loads(data)
    return f'Your pretty obj is: {deserialized}'

if __name__ == '__main__':
    app.run(port=8001)
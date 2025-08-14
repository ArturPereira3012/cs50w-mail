Markdown
# CS50W Mail - Single Page Email Client Application

A dynamic front-end email client that sends, receives, and archives emails asynchronously by consuming an internal Django API, built as part of Harvard's **CS50's Web Programming with Python and JavaScript** course.

## 🚀 Features

- **Send Mail:** A user-friendly form that allows users to send emails. The form submissions are processed completely in the background via asynchronous JavaScript `POST` requests.
- **Mailboxes:** Dynamic rendering of the *Inbox*, *Sent*, and *Archive* mailboxes. The system loads appropriate emails from the API without reloading the entire page.
- **View Email:** Clicking an email expands it to show the sender, recipients, subject, timestamp, and body. Once clicked, the email is automatically updated via the API as "read" (changing its background layout color).
- **Archive/Unarchive:** Active dynamic buttons inside the email view that allow users to archive incoming messages or move them back to the inbox.
- **Reply System:** An intelligent reply mechanic that pre-fills the composition form with the original sender, adjusts the subject line to include "Re:" (if not already present), and appends the original message structure.
- **Single Page Architecture:** The entire app runs inside a single HTML file, manipulating the DOM dynamically using JavaScript to toggle views.

## 🛠️ Tech Stack

- **Frontend:** JavaScript (ES6+, Fetch API, DOM Manipulation), HTML5, CSS3, Bootstrap
- **Backend API:** Python, Django framework

## 📦 Installation and Local Setup

Follow these steps to get this project running on your local machine:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/ArturPereira3012/cs50w-mail.git](https://github.com/ArturPereira3012/cs50w-mail.git)
   cd cs50w-mail

2. Apply database migrations:
python manage.py migrate

3.Start the development server:
python manage.py runserver

4. Access the application:
Open your preferred web browser and navigate to http://127.0.0.1:8000/.

This project was developed as an academic assignment for the CS50W course, fulfilling all the strict design specifications provided by Harvard University.

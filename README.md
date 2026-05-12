# AI Document Intelligence

A premium, enterprise-grade document processing platform that leverages Generative AI to extract structured entities from unstructured documents (PDFs, Images, and DOCX).

![Project Preview](https://img.shields.io/badge/Status-Production--Ready-success?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-React_|_FastAPI_|_MongoDB_|_Groq-blue?style=for-the-badge)

## 🚀 Features

- **Multi-Format Support**: Seamlessly process PDFs, Word documents, and high-resolution images.
- **AI-Powered Extraction**: Uses advanced LLMs (Llama 3 via Groq) to identify and extract key fields like names, amounts, and dates.
- **Secure Authentication**: Built-in JWT-based login/signup system with per-user document isolation.
- **Modern UI/UX**: Stunning glassmorphism design with full **Dark/Light Mode** support.
- **Persistent Storage**: All extractions are securely saved in MongoDB Atlas.
- **Export Capabilities**: Download extraction results as structured JSON files.

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS + Custom CSS Variables
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Deployment**: Vercel

### Backend
- **Framework**: FastAPI (Python 3.12)
- **Database**: MongoDB Atlas (PyMongo)
- **AI Engine**: Groq SDK
- **Security**: JWT (jose), Bcrypt for password hashing
- **Deployment**: Render

## ⚙️ Environment Variables

To run this project locally, create a `.env` file in the `backend` directory:

```env
MONGO_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key
JWT_SECRET=your_secret_signing_key
```

## 📦 Installation & Setup

### Backend
1. Navigate to the `backend` folder.
2. Install dependencies: `pip install -r requirements.txt`.
3. Run the server: `uvicorn main:app --reload`.

### Frontend
1. Navigate to the `frontend` folder.
2. Install dependencies: `npm install`.
3. Start the dev server: `npm run dev`.

---

## 📄 License
Internal Proprietary Project - Handed over to Client.

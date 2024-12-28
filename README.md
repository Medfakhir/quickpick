# Store Website with admin dashboard by Medfakhir (Medev) 

This is a store website created by **Medfakhir (Medev)** using modern web development tools. The project emphasizes performance, scalability, and a clean, responsive design.

---

## Technologies Used

- **Framework**: [Next.js](https://nextjs.org)
- **Database**: [MongoDB](https://www.mongodb.com) with [Prisma](https://www.prisma.io)
- **Styling**: [TailwindCSS](https://tailwindcss.com)

This project was initialized using [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app), offering a robust structure for scalable web applications.

---

## Features

- 🚀 **Fast and Modern**: Built with Next.js for server-side rendering and optimized performance.
- 🛠️ **Database-Driven**: Prisma ORM for seamless interaction with MongoDB.
- 🎨 **Beautiful UI**: Styled with TailwindCSS for a clean and responsive design.
- 🔄 **Real-Time Updates**: Next.js auto-updates during development for instant feedback.

---

## Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites

Ensure you have the following installed:

- **Node.js**: [Download Node.js](https://nodejs.org) (v16 or higher recommended)
- **MongoDB**: [Set up MongoDB](https://www.mongodb.com/docs/manual/installation) (or access to a MongoDB Atlas cluster)

---

### 1. Install Dependencies

To install the project dependencies, run the following command:

```bash
npm install
# or
yarn install
# or
pnpm install


2. Set Up Environment Variables
The application requires environment variables for configuration. Create a .env file in the root directory and add the following variables:

env
Copy code
DATABASE_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>?retryWrites=true&w=majority
NEXTAUTH_SECRET=<your-secret>
Replace <username>, <password>, <dbname>, and <your-secret> with your actual MongoDB credentials and a secret key for authentication.

3. Run Prisma Migrations
Run the following command to set up the database schema:

bash
Copy code
npx prisma migrate dev
This will apply the necessary migrations to your MongoDB database, ensuring it is ready for use.

Running the Development Server
Start the development server with the following command:

bash
Copy code
npm run dev
# or
yarn dev
# or
pnpm dev
Visit http://localhost:3000 in your browser to view the application.

You can edit the main page in app/page.js, and the changes will be reflected immediately.

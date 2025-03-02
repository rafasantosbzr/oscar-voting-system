# Oscar Preferential Voting System

A web application for conducting preferential (ranked-choice) voting for Oscar nominees, built with React, TypeScript, and Supabase.

## Features

- **Authentication**: Email/password login system
- **Drag-and-Drop Ranking**: Interactive interface to rank nominees
- **One Vote Per User**: Prevention of duplicate votes
- **Preferential Voting Algorithm**: Implements instant-runoff voting system
- **Admin Panel**: Special access for calculating final results
- **Responsive Design**: Oscar-themed UI that works on all devices

## Live Demo

[[Oscar Voting System Web App](https://oscarvotingsystemsimulator.netlify.app/)]

## Technology Stack

- React
- TypeScript
- Supabase (Backend & Authentication)
- Vite (Build Tool)
- CSS (Custom styling)

## Local Development

1. Clone the repository:
```bash
git clone [https://github.com/rafasantosbzr/oscar-voting-system]
cd oscar-voting-system
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

## Database Setup

The application requires two main tables in Supabase:

### Nominees Table
```sql
create table nominees (
  id bigint primary key,
  title text not null
);
```

### Votes Table
```sql
create table votes (
  id bigint generated by default as identity primary key,
  rankings bigint[] not null,
  user_email text not null,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create unique index to prevent multiple votes
CREATE UNIQUE INDEX one_vote_per_user 
ON votes(user_email);
```

## Voting System Explanation

The application uses a preferential voting system (instant-runoff voting):

1. Voters rank all nominees in order of preference
2. First-choice votes are counted
3. If no nominee has a majority:
   - The nominee with the fewest votes is eliminated
   - Votes for eliminated nominee redistribute to voters' next choices
4. Process repeats until a winner emerges

## Deployment

The application is deployed on Netlify. To deploy your own instance:

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Set environment variables in Netlify:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

## Project Structure

```
oscar-voting-system/
├── src/
│   ├── components/
│   │   ├── AdminPanel.tsx
│   │   ├── Login.tsx
│   │   ├── NomineeCard.tsx
│   │   └── VotingForm.tsx
│   ├── services/
│   │   └── api.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── public/
├── index.html
└── package.json
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by the Academy Awards voting system
- Built with Supabase's excellent authentication and database services
- Thanks to the React and TypeScript communities

## Contact

Rafael Santos - [rafasantosbzr@icloud.com]

Project Link: [https://oscarvotingsystemsimulator.netlify.app/]

---
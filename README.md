# Splitify - Expense Splitting Responsive Web App build with Next.Js

Responsive Web Application to split up expenses from different events equally among all participants. The App calculates who owes how much to whom, and shows statistics who paid for what. In the end you can send the results with a form to an E-Mail recipient. The App has a full Authentication and Authorization process, a user only has access after registering and logging in with an account.

## Dependencies

- Next.js
- Typescript
- PostgreSQL
- Postgres.js
- @emotion/css
- JS Cookie
- dotenv-safe
- ley
- bcrypt
- cloudinary
- chart.js
- nodemailer
- Gmail API
- Jest
- Jest-Puppeteer

## Setup

Clone the repo from GitHub and then install the dependencies:

```
git clone https://github.com/flo951/final-project-upleveled
cd final-project-upleveled
yarn
```

Setup a database with postgres on your computer:

```
psql <login>
CREATE DATABASE <database name>;
CREATE USER <username> WITH ENCRYPTED PASSWORD '<pw>';
GRANT ALL PRIVILEGES ON DATABASE <database name> TO <user name>;
```

Create a .env file with the userinfo for the database and create .env.example as a template file for userinfo

Use migrations:

```
yarn migrate up
```

To delete data from database run:

```
yarn migrate down
```

To run the development server:

```
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

To create the production build of the project run:

```
yarn build
yarn start
```

## Deployment

To deploy this project, create a [Heroku Account](https://signup.heroku.com/) and follow the instructions

## Project Preview

### Images from the Application

<div>
<img src="/public/images/eventpic1.png" width="382" height="586">
<img src="/public/images/eventpic2.png" width="382" height="586">
  </div>
  <div>
<img src="/public/images/eventpic3.png" width="382" height="586">
<img src="/public/images/email_form.png" width="382" height="586">
</div>

### E-Mail

<img src="/public/images/email.png">

### DrawSQL Database Schema

<img src="/public/images/drawsql.png" width="900" height="500">

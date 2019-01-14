import axios from 'axios';

const instance = axios.create({
  headers: {
    'Private-Token': process.env.GITLAB_TOKEN
  }
});

export default instance;

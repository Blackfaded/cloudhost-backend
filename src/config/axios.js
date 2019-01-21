import axios from 'axios';
import connections from './connections';

const instance = axios.create({
	baseURL: connections.gitlab.domain
});

export default instance;

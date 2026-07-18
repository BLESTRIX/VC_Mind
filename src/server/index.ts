import { getEnv } from '../lib/env.js';import { log } from '../lib/logger.js';import { buildServer } from './app.js';
const env=getEnv();const app=await buildServer();await app.listen({host:env.HOST,port:env.PORT});log('info','VC Brain backend listening',{service:'api',status:'started',host:env.HOST,port:env.PORT});

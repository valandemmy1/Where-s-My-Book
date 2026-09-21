import {json,getUser} from '../../_lib/auth.js';
export async function onRequestGet({request,env}){
  try{const user=await getUser(request,env);return json({user:user||null});}
  catch(err){console.error('Optional auth lookup failed',err);return json({user:null});}
}

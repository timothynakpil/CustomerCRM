
// Follow this setup guide to integrate the Supabase Admin SDK: https://supabase.com/docs/reference/javascript/admin-api
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UpdateRolePayload {
  email: string;
  role: 'admin' | 'user' | 'blocked';
}

export const handler = async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user.
    const supabaseClient = createClient(
      // Supabase API URL - env var exposed by default.
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var exposed by default.
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      // Create client with Auth context of the user that called the function.
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Now we can get the session or user object
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Not authorized' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    // Create a Supabase client with service_role to access admin API
    const adminAuthClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get the request payload
    const { email, role } = await req.json() as UpdateRolePayload;

    // Fetch the user by email
    const { data: usersData, error: usersError } = await adminAuthClient.auth.admin.listUsers();

    if (usersError) {
      throw usersError;
    }

    const targetUser = usersData.users.find(user => user.email === email);
    
    if (!targetUser) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    // Update the user role in metadata
    const { data, error } = await adminAuthClient.auth.admin.updateUserById(
      targetUser.id,
      { user_metadata: { role } }
    );

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ message: 'User role updated successfully', user: data.user }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
}

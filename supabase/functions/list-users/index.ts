
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    })
  }

  try {
    console.log("list-users: Function called");
    
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the authenticated user to check their role
    const { data: { user: authenticatedUser } } = await supabaseClient.auth.getUser()
    
    if (!authenticatedUser) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    // Create admin auth client for accessing user data
    const adminAuthClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch all users through Admin API (regardless of the requesting user's role)
    // All authenticated users can see the list, but actions will be limited by role
    const { data, error } = await adminAuthClient.auth.admin.listUsers()

    if (error) {
      console.error("Error listing users:", error);
      throw error;
    }

    // Transform the users data to include only necessary information
    const usersData = data.users.map(user => ({
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role || 'user',
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at
    }));

    // Always ensure "jrdeguzman3647@gmail.com" is marked as owner
    const finalUsersData = usersData.map(user => {
      if (user.email === 'jrdeguzman3647@gmail.com' && user.role !== 'owner') {
        return { ...user, role: 'owner' };
      }
      return user;
    });

    console.log(`Successfully retrieved ${finalUsersData.length} users`);

    return new Response(
      JSON.stringify(finalUsersData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error("Error in list-users function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

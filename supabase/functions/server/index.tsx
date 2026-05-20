import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const app = new Hono();

// Create Supabase clients
const getServiceClient = () => createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const getAnonClient = () => createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!,
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-261c5efb/health", (c) => {
  return c.json({ status: "ok" });
});

// Signup endpoint
app.post("/make-server-261c5efb/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const supabase = getServiceClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name || '' },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.log('Signup exception:', error);
    return c.json({ error: 'Signup failed' }, 500);
  }
});

// Get climbs endpoint (protected)
app.get("/make-server-261c5efb/climbs", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'No authorization header' }, 401);
    }

    // Create a Supabase client with the user's access token
    // RLS policies will automatically filter data based on auth.uid()
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    );

    const { data, error } = await supabase
      .from('climbs')
      .select('*')
      .order('day', { ascending: false });

    if (error) {
      console.log('Error fetching climbs:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ climbs: data });
  } catch (error) {
    console.log('Get climbs exception:', error);
    return c.json({ error: 'Failed to fetch climbs' }, 500);
  }
});

// Add climb endpoint (protected)
app.post("/make-server-261c5efb/climbs", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'No authorization header' }, 401);
    }

    // Create a Supabase client with the user's access token
    // RLS policies and triggers will automatically set user_id based on auth.uid()
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    );

    const climb = await c.req.json();
    const { data, error } = await supabase
      .from('climbs')
      .insert([climb])
      .select();

    if (error) {
      console.log('Error adding climb:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ climb: data[0] });
  } catch (error) {
    console.log('Add climb exception:', error);
    return c.json({ error: 'Failed to add climb' }, 500);
  }
});

// Delete climb endpoint (protected)
app.delete("/make-server-261c5efb/climbs/:id", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'No authorization header' }, 401);
    }

    // Create a Supabase client with the user's access token
    // RLS policies will automatically filter based on auth.uid()
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    );

    const id = c.req.param('id');
    const { error } = await supabase
      .from('climbs')
      .delete()
      .eq('id', id);

    if (error) {
      console.log('Error deleting climb:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true });
  } catch (error) {
    console.log('Delete climb exception:', error);
    return c.json({ error: 'Failed to delete climb' }, 500);
  }
});

Deno.serve(app.fetch);
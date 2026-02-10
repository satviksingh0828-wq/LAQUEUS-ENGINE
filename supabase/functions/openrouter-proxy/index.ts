import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ApiKey {
  id: string;
  key_name: string;
  api_key: string;
  priority: number;
  is_active: boolean;
}

interface Model {
  id: string;
  model_name: string;
  display_name: string;
  priority: number;
  is_active: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { message } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: apiKeys, error: keysError } = await supabase
      .from("api_keys")
      .select("*")
      .eq("is_active", true)
      .order("priority", { ascending: true });

    if (keysError || !apiKeys || apiKeys.length === 0) {
      return new Response(
        JSON.stringify({ error: "No API keys configured" }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: models, error: modelsError } = await supabase
      .from("models")
      .select("*")
      .eq("is_active", true)
      .order("priority", { ascending: true });

    if (modelsError || !models || models.length === 0) {
      return new Response(
        JSON.stringify({ error: "No models configured" }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let lastError = null;
    let successfulResponse = null;

    for (const apiKey of apiKeys as ApiKey[]) {
      for (const model of models as Model[]) {
        try {
          const openRouterResponse = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${apiKey.api_key}`,
                "Content-Type": "application/json",
                "HTTP-Referer": supabaseUrl,
                "X-Title": "Laqueus Engine",
              },
              body: JSON.stringify({
                model: model.model_name,
                messages: [
                  {
                    role: "user",
                    content: message,
                  },
                ],
              }),
            }
          );

          if (openRouterResponse.ok) {
            const data = await openRouterResponse.json();
            successfulResponse = {
              response: data.choices[0].message.content,
              model_used: model.model_name,
              model_display_name: model.display_name,
              key_used: apiKey.key_name,
              usage: data.usage,
            };
            break;
          } else {
            const errorData = await openRouterResponse.text();
            lastError = `${model.model_name} (${apiKey.key_name}): ${errorData}`;
          }
        } catch (error) {
          lastError = `${model.model_name} (${apiKey.key_name}): ${
            error instanceof Error ? error.message : "Unknown error"
          }`;
        }
      }

      if (successfulResponse) break;
    }

    if (successfulResponse) {
      return new Response(JSON.stringify(successfulResponse), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      return new Response(
        JSON.stringify({
          error: "All API keys and models failed",
          last_error: lastError,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

package config
import (
    supabase "github.com/supabase-community/supabase-go"
)

func GetSupabaseClient() *supabase.Client{

    client, err := supabase.NewClient(
        "https://YOUR_PROJECT_ID.supabase.co",
        "YOUR_SUPABASE_ANON_OR_SERVICE_ROLE_KEY",
        nil,
    )
    if err != nil {
        panic(err)
    }

	return client
}


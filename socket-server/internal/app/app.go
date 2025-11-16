package app


import (
    supabase "github.com/supabase-community/supabase-go"
)


type App struct {
	SupabaseClient *supabase.Client
}

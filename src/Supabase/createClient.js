import {createClient} from "@supabase/supabase-js";

export const supabase= createClient(
    "https://onvizcnnptpdimwyghsg.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9udml6Y25ucHRwZGltd3lnaHNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzczMDIsImV4cCI6MjA3MjA1MzMwMn0.D34WzAKwk4TLSW0dP7fI0Jyya18mgq1TGb2ATT0Gbdg"
    )
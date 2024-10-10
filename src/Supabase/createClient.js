import {createClient} from "@supabase/supabase-js";

export const supabase= createClient(
    "https://jrbpwisclowinultbehj.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyYnB3aXNjbG93aW51bHRiZWhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU3NTc4NjMsImV4cCI6MjA0MTMzMzg2M30.dFbRcWi0v7zdiR58ZcuTNfMTzi_GKg_56VL1-UT2JYs"
    )
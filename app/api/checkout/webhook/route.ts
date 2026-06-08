import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Inizializziamo Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16" as any,
});

// Inizializziamo il client Supabase con i privilegi di servizio (Service Role)
// Nota: Usiamo la SERVICE_ROLE_KEY se presente per bypassare eventuali blocchi RLS in scrittura
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    // Verifichiamo che l'evento sia autentico e provenga da Stripe
    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error("Firma del webhook o STRIPE_WEBHOOK_SECRET mancante.");
    }
    
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error(`❌ Errore di validazione del Webhook: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Gestiamo l'evento specifico: quando un abbonamento viene pagato con successo
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Recuperiamo i metadati che abbiamo salvato durante la creazione del checkout
    const metadata = session.metadata;

    if (metadata && metadata.agency_name && metadata.agency_slug && metadata.agency_email) {
      const { agency_name, agency_slug, agency_email } = metadata;

      console.log(`🏠 Tentativo di attivazione spazio per: ${agency_name} (/${agency_slug})`);

      // Inseriamo la nuova agenzia all'interno della tabella del tuo database Supabase
      // Modifica il nome della tabella ("agencies" o "registrazioni") in base al tuo schema reale
      const { data, error } = await supabase
        .from("agencies") 
        .insert([
          {
            name: agency_name,
            slug: agency_slug,
            email: agency_email,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            status: "active", // L'agenzia è ora attiva a tutti gli effetti!
            created_at: new Date().toISOString(),
          },
        ]);

      if (error) {
        console.error("❌ Errore durante il salvataggio dell'agenzia su Supabase:", error.message);
        return NextResponse.json({ error: "Errore salvataggio DB" }, { status: 500 });
      }

      console.log(`✅ Agenzia ${agency_name} creata e sbloccata con successo su Supabase!`);
    }
  }

  // Rispondiamo a Stripe con un 200 OK per confermare la ricezione dell'evento
  return NextResponse.json({ received: true }, { status: 200 });
}
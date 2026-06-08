import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16" as any,
});

export async function POST(req: Request) {
  try {
    const { name, slug, email } = await req.json();

    if (!name || !slug || !email) {
      return NextResponse.json(
        { error: "Tutti i campi sono obbligatori." },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_PRICE_ID) {
      return NextResponse.json(
        { error: "Configurazione STRIPE_PRICE_ID mancante nel file .env.local" },
        { status: 500 }
      );
    }

    // Creiamo la sessione usando l'ID del prezzo fisso che hai creato su Stripe (279€)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID, // Usa il tuo ID listino
          quantity: 1,
        },
      ],
      mode: "subscription",
      metadata: {
        agency_name: name,
        agency_slug: slug,
        agency_email: email,
      },
      success_url: `${req.headers.get("origin")}/${slug}/dashboard`,
      cancel_url: `${req.headers.get("origin")}/register`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Errore Stripe Checkout:", error);
    return NextResponse.json(
      { error: error.message || "Errore interno del server" },
      { status: 500 }
    );
  }
}
import { notFound } from "next/navigation";
import { getTripWithDetailsBySlug } from "@/lib/db";
import { todayString } from "@/lib/utils";
import ClientTripView from "./ClientTripView";

export const dynamic = "force-dynamic";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props) {
  const trip = await getTripWithDetailsBySlug(params.slug);
  if (!trip) return { title: "Trip Not Found" };
  return {
    title: `${trip.client_name} — ${trip.destination} | TripLive`,
    description: `Your private itinerary for ${trip.destination}`,
  };
}

export default async function TripPage({ params }: Props) {
  const trip = await getTripWithDetailsBySlug(params.slug);
  if (!trip) notFound();

  const today = todayString();

  return (
    <ClientTripView
      trip={trip!}
      today={today}
    />
  );
}

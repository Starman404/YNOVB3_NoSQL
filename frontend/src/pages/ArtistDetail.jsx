import { useParams } from "react-router-dom";

export default function ArtistDetail() {
  const { id } = useParams();
  return (
    <div>
      <h1>Fiche artiste</h1>
      <p>MBID: {id}</p>
      <p>TODO: infos artiste, morceaux, releases, collaborations.</p>
    </div>
  );
}

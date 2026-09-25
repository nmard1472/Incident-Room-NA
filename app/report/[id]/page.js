import { supabase } from "../../lib/supabase";

// The public face of a published report. This is the page you send your chief.
//
// Deliberately separate from the evidence board: whoever opens this link sees
// the finished case file and nothing else. No clue list, no buttons, no way
// into your working copy. It prints to a clean PDF too.
export default async function PublishedReport({ params }) {
  const { id } = await params;
  const { data: report } = await supabase.from("reports").select("body, created_at").eq("id", id).single();

  return (
    <main className="published">
      <article className="casefile">
        <span className="cf-stamp">Confidentiel</span>
        <div className="cf-head">
          <p>Dossier &middot; Affaire Apollon</p>
          <p className="cf-sub">R&eacute;f. {id}</p>
        </div>
        <div className="cf-body">
          {report
            ? report.body
            : `NO REPORT IS FILED UNDER THIS REFERENCE.

Somebody sent you a link to a case file that either was never saved, or has since been removed.`}
        </div>
        <div className="cf-foot">
          <p className="cracked">You cracked the case and deployed your first app online!</p>
          <p className="brand">Build First</p>
        </div>
      </article>
      <a className="back" href="/">&larr; Back to the evidence board</a>
    </main>
  );
}

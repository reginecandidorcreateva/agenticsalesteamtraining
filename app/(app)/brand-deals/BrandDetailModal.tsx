"use client";
import type { Brand } from "./types";
import ArtifactPanel from "./ArtifactPanel";

export default function BrandDetailModal({
  brand,
  onClose,
  onUpdate,
}: {
  brand: Brand;
  onClose: () => void;
  onUpdate: (b: Brand) => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(37,8,53,.45)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "40px 18px",
        overflowY: "auto",
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: 32,
          maxWidth: 620,
          width: "100%",
          boxShadow: "rgba(37, 8, 53, 0.25) 0px 24px 48px -12px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div>
            <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 22, color: "#250835" }}>{brand.name}</div>
            {brand.website && <div style={{ fontSize: 13, color: "#6a5b72", marginTop: 2 }}>{brand.website}</div>}
            {brand.contactEmail && <div style={{ fontSize: 13, color: "#6a5b72", marginTop: 2 }}>{brand.contactEmail}</div>}
            {brand.notes && <div style={{ fontSize: 12.5, color: "#a79bb0", marginTop: 6 }}>{brand.notes}</div>}
          </div>
          <button onClick={onClose} aria-label="Close" style={{ fontSize: 20, color: "#a79bb0", background: "none", border: "none", cursor: "pointer", lineHeight: 1 }}>
            ×
          </button>
        </div>

        <ArtifactPanel
          title="Research brief"
          value={brand.brief}
          updatedAt={brand.briefUpdatedAt}
          buttonLabel="Research this brand"
          refreshLabel="Refresh brief"
          endpoint={`/api/brands/${brand.id}/research`}
          onResult={onUpdate}
        />
        <ArtifactPanel
          title="Pitch"
          value={brand.pitch}
          updatedAt={brand.pitchUpdatedAt}
          buttonLabel="Write a pitch"
          refreshLabel="Rewrite pitch"
          endpoint={`/api/brands/${brand.id}/pitch`}
          onResult={onUpdate}
        />
        <ArtifactPanel
          title="Proposal"
          value={brand.proposal}
          updatedAt={brand.proposalUpdatedAt}
          buttonLabel="Write a proposal"
          refreshLabel="Rewrite proposal"
          endpoint={`/api/brands/${brand.id}/proposal`}
          onResult={onUpdate}
        />
        <ArtifactPanel
          title="Follow-up"
          value={brand.followup}
          updatedAt={brand.followupUpdatedAt}
          buttonLabel="Write a follow-up"
          refreshLabel="Rewrite follow-up"
          endpoint={`/api/brands/${brand.id}/followup`}
          disabledReason={
            !brand.pitch && !brand.proposal
              ? "Send a pitch or proposal to this brand first — Follow-up needs something to build on."
              : undefined
          }
          onResult={onUpdate}
        />
      </div>
    </div>
  );
}

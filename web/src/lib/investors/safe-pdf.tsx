import React from "react"
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface SafePdfData {
  investorName: string
  investorCompany: string
  investorEmail: string
  purchaseAmountCents: number
  valuationCapCents: number
  date: string // ISO date string for the agreement date
  // Signing info (only present if signed)
  investorSignature?: string
  investorSignedAt?: string
  investorSignIp?: string
  investorSignUa?: string
  documentHash?: string
  // Countersign info
  companySignature?: string
  companySignedAt?: string
  companySignIp?: string
}

/* ------------------------------------------------------------------ */
/*  Fonts                                                              */
/* ------------------------------------------------------------------ */

Font.register({
  family: "Helvetica",
  fonts: [
    { src: "Helvetica" },
    { src: "Helvetica-Bold", fontWeight: "bold" },
    { src: "Helvetica-Oblique", fontStyle: "italic" },
  ],
})

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.5,
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 65,
    color: "#1a1a1a",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    textAlign: "center",
    marginBottom: 24,
    color: "#444",
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 18,
    marginBottom: 8,
  },
  subsectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 10,
    marginBottom: 8,
    textAlign: "justify",
  },
  indent: {
    fontSize: 10,
    marginBottom: 6,
    marginLeft: 20,
    textAlign: "justify",
  },
  doubleIndent: {
    fontSize: 10,
    marginBottom: 6,
    marginLeft: 40,
    textAlign: "justify",
  },
  bold: {
    fontWeight: "bold",
  },
  italic: {
    fontStyle: "italic",
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    marginTop: 30,
    marginBottom: 4,
    width: 250,
  },
  signatureLabel: {
    fontSize: 9,
    color: "#666",
    marginBottom: 2,
  },
  signatureValue: {
    fontSize: 10,
    marginBottom: 12,
  },
  signatureBlock: {
    marginTop: 20,
  },
  certPage: {
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.5,
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 65,
    color: "#1a1a1a",
  },
  certTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#1a1a1a",
  },
  certRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  certLabel: {
    fontSize: 9,
    fontWeight: "bold",
    width: 120,
    color: "#666",
  },
  certValue: {
    fontSize: 10,
    flex: 1,
  },
  certDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginVertical: 12,
  },
  certNotice: {
    fontSize: 8,
    color: "#888",
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 65,
    right: 65,
    fontSize: 8,
    color: "#999",
    textAlign: "center",
  },
})

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function fmt(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/* ------------------------------------------------------------------ */
/*  SAFE PDF Document                                                  */
/* ------------------------------------------------------------------ */

export function SafePdf({ data }: { data: SafePdfData }) {
  const purchaseAmount = fmt(data.purchaseAmountCents)
  const valuationCap = fmt(data.valuationCapCents)
  const agreementDate = fmtDate(data.date)
  const investorLine = data.investorCompany
    ? `${data.investorName} (${data.investorCompany})`
    : data.investorName

  return (
    <Document>
      {/* ============================================================ */}
      {/*  Page 1-3: SAFE Agreement                                     */}
      {/* ============================================================ */}
      <Page size="LETTER" style={s.page}>
        <Text style={s.title}>SAFE</Text>
        <Text style={s.subtitle}>
          (Simple Agreement for Future Equity)
        </Text>

        <Text style={s.paragraph}>
          THIS CERTIFIES THAT in exchange for the payment by {investorLine} (the{" "}
          <Text style={s.bold}>&quot;Investor&quot;</Text>) of {purchaseAmount} (the{" "}
          <Text style={s.bold}>&quot;Purchase Amount&quot;</Text>) on or about {agreementDate},{" "}
          Phosra, Inc., a Delaware corporation (the <Text style={s.bold}>&quot;Company&quot;</Text>),
          hereby issues to the Investor the right to certain shares of the Company&apos;s capital
          stock, subject to the terms set forth below.
        </Text>

        <Text style={s.paragraph}>
          The <Text style={s.bold}>&quot;Valuation Cap&quot;</Text> is {valuationCap}.
        </Text>

        <Text style={s.paragraph}>
          See <Text style={s.bold}>Section 2</Text> for certain additional defined terms.
        </Text>

        {/* ── Section 1: Events ────────────────────────────────── */}
        <Text style={s.sectionTitle}>1. Events</Text>

        <Text style={s.subsectionTitle}>(a) Equity Financing.</Text>
        <Text style={s.indent}>
          If there is an Equity Financing before the termination of this Safe, on the initial
          closing of such Equity Financing, this Safe will automatically convert into the greater
          of: (1) the number of shares of Standard Preferred Stock equal to the Purchase Amount
          divided by the lowest price per share of the Standard Preferred Stock; or (2) the number
          of shares of Safe Preferred Stock equal to the Purchase Amount divided by the Safe Price.
        </Text>
        <Text style={s.indent}>
          In connection with the automatic conversion of this Safe into shares of Safe Preferred
          Stock, the Company will create a new series of preferred stock having the identical
          rights, privileges, preferences and restrictions as the shares of Standard Preferred Stock
          issued in the Equity Financing, except that the Post-Money Valuation Cap will be used for
          determining the price per share, the liquidation preference, and the conversion price
          for purposes of price-based anti-dilution protection.
        </Text>
        <Text style={s.indent}>
          In the event of an Equity Financing, the initial closing of which occurs within ninety (90)
          days of the issuance of this Safe, the Company will, at the option of the Investor, either
          (a) apply the Purchase Amount to the purchase of shares of Standard Preferred Stock at the
          price per share paid by the other investors in the Equity Financing, or (b) convert this
          Safe into shares of Safe Preferred Stock as described above.
        </Text>

        <Text style={s.subsectionTitle}>(b) Liquidity Event.</Text>
        <Text style={s.indent}>
          If there is a Liquidity Event before the termination of this Safe, the Investor will, at
          its option, either (i) receive a cash payment equal to the Purchase Amount (the{" "}
          <Text style={s.bold}>&quot;Cash-Out Amount&quot;</Text>) or (ii) automatically receive
          from the Company a number of shares of Common Stock equal to the Purchase Amount divided
          by the Liquidity Price, if the Investor fails to select the cash option.
        </Text>

        <Text style={s.subsectionTitle}>(c) Dissolution Event.</Text>
        <Text style={s.indent}>
          If there is a Dissolution Event before the termination of this Safe, the Investor will
          automatically be entitled to receive a portion of the Proceeds equal to the Cash-Out
          Amount, due and payable to the Investor immediately prior to, or concurrent with, the
          consummation of the Dissolution Event.
        </Text>

        <Text style={s.subsectionTitle}>(d) Termination.</Text>
        <Text style={s.indent}>
          This Safe will automatically terminate (without relieving the Company of any obligations
          arising from a prior breach of or non-compliance with this Safe) immediately following the
          earliest to occur of: (i) the issuance of Capital Stock to the Investor pursuant to the
          automatic conversion of this Safe under Section 1(a); or (ii) the payment, or setting
          aside for payment, of amounts due the Investor pursuant to Section 1(b) or Section 1(c).
        </Text>

        <Text style={s.footer}>
          SAFE — Phosra, Inc. — {agreementDate}
        </Text>
      </Page>

      <Page size="LETTER" style={s.page}>
        {/* ── Section 2: Definitions ──────────────────────────── */}
        <Text style={s.sectionTitle}>2. Definitions</Text>

        <Text style={s.indent}>
          <Text style={s.bold}>&quot;Capital Stock&quot;</Text> means the capital stock of the
          Company, including, without limitation, the Common Stock and Preferred Stock.
        </Text>
        <Text style={s.indent}>
          <Text style={s.bold}>&quot;Change of Control&quot;</Text> means (i) a transaction or
          series of related transactions in which any &quot;person&quot; or &quot;group&quot; (within
          the meaning of Sections 13(d) and 14(d) of the Securities Exchange Act of 1934, as
          amended), becomes the &quot;beneficial owner&quot; (as defined in Rule 13d-3 under the
          Securities Exchange Act of 1934, as amended), directly or indirectly, of more than 50% of
          the outstanding voting securities of the Company having the right to vote for members of
          the Company&apos;s board of directors, (ii) any reorganization, merger or consolidation of
          the Company, other than a transaction or series of related transactions in which the
          holders of the voting securities of the Company outstanding immediately prior to such
          transaction or series of related transactions retain, immediately after such transaction
          or series of related transactions, at least a majority of the total voting power
          represented by the outstanding voting securities of the Company or such other surviving or
          resulting entity, or (iii) a sale, lease or other disposition of all or substantially all
          of the assets of the Company.
        </Text>
        <Text style={s.indent}>
          <Text style={s.bold}>&quot;Common Stock&quot;</Text> means the common stock of the
          Company.
        </Text>
        <Text style={s.indent}>
          <Text style={s.bold}>&quot;Company Capitalization&quot;</Text> is calculated as of
          immediately prior to the Equity Financing and (without double-counting, in each case
          calculated on an as-converted to Common Stock basis):
        </Text>
        <Text style={s.doubleIndent}>
          (i) All shares of Capital Stock issued and outstanding;
        </Text>
        <Text style={s.doubleIndent}>
          (ii) All outstanding stock options or similar rights to purchase shares, whether vested or
          unvested, and including any shares reserved and available for future grant under any
          equity incentive or similar plan;
        </Text>
        <Text style={s.doubleIndent}>
          (iii) The shares of Capital Stock issuable upon conversion of all outstanding convertible
          securities (other than SAFEs);
        </Text>
        <Text style={s.doubleIndent}>
          (iv) The shares reserved for issuance pursuant to all SAFEs and convertible notes
          outstanding.
        </Text>
        <Text style={s.indent}>
          <Text style={s.bold}>&quot;Dissolution Event&quot;</Text> means (i) a voluntary
          termination of operations, (ii) a general assignment for the benefit of the
          Company&apos;s creditors, or (iii) any other liquidation, dissolution, or winding up of
          the Company (excluding a Liquidity Event), whether voluntary or involuntary.
        </Text>
        <Text style={s.indent}>
          <Text style={s.bold}>&quot;Equity Financing&quot;</Text> means a bona fide transaction or
          series of transactions with the principal purpose of raising capital, pursuant to which
          the Company issues and sells Preferred Stock at a fixed valuation, including but not
          limited to, a pre-money or post-money valuation.
        </Text>
        <Text style={s.indent}>
          <Text style={s.bold}>&quot;Initial Public Offering&quot;</Text> means the closing of the
          Company&apos;s first firm commitment underwritten initial public offering of Common Stock
          pursuant to a registration statement filed under the Securities Act.
        </Text>
        <Text style={s.indent}>
          <Text style={s.bold}>&quot;Liquidity Capitalization&quot;</Text> is calculated as of
          immediately prior to the Liquidity Event, and (without double-counting, in each case
          calculated on an as-converted to Common Stock basis):
        </Text>
        <Text style={s.doubleIndent}>
          (i) All shares of Capital Stock issued and outstanding;
        </Text>
        <Text style={s.doubleIndent}>
          (ii) All outstanding stock options or similar rights, whether vested or unvested;
        </Text>
        <Text style={s.doubleIndent}>
          (iii) The shares issuable upon conversion of all outstanding convertible securities (other
          than SAFEs);
        </Text>
        <Text style={s.doubleIndent}>
          (iv) The shares reserved for issuance pursuant to all SAFEs and convertible notes.
        </Text>
        <Text style={s.indent}>
          <Text style={s.bold}>&quot;Liquidity Event&quot;</Text> means a Change of Control or an
          Initial Public Offering.
        </Text>
        <Text style={s.indent}>
          <Text style={s.bold}>&quot;Liquidity Price&quot;</Text> means the price per share equal
          to the Valuation Cap divided by the Liquidity Capitalization.
        </Text>
        <Text style={s.indent}>
          <Text style={s.bold}>&quot;Post-Money Valuation Cap&quot;</Text> means the Valuation Cap.
        </Text>
        <Text style={s.indent}>
          <Text style={s.bold}>&quot;Preferred Stock&quot;</Text> means the preferred stock of the
          Company.
        </Text>

        <Text style={s.footer}>
          SAFE — Phosra, Inc. — {agreementDate}
        </Text>
      </Page>

      <Page size="LETTER" style={s.page}>
        <Text style={s.indent}>
          <Text style={s.bold}>&quot;Proceeds&quot;</Text> means cash and other assets (including
          without limitation stock consideration) that are proceeds from the Dissolution Event.
        </Text>
        <Text style={s.indent}>
          <Text style={s.bold}>&quot;Safe&quot;</Text> means this instrument.
        </Text>
        <Text style={s.indent}>
          <Text style={s.bold}>&quot;Safe Preferred Stock&quot;</Text> means the shares of a series
          of Preferred Stock issued to the Investor in an Equity Financing, having the identical
          rights, privileges, preferences and restrictions as the Standard Preferred Stock, other
          than with respect to: (i) the per share liquidation preference, which will equal the Safe
          Price; and (ii) the conversion price for purposes of price-based anti-dilution protection,
          which will be based on the Safe Price.
        </Text>
        <Text style={s.indent}>
          <Text style={s.bold}>&quot;Safe Price&quot;</Text> means the price per share equal to the
          Post-Money Valuation Cap divided by the Company Capitalization.
        </Text>
        <Text style={s.indent}>
          <Text style={s.bold}>&quot;Securities Act&quot;</Text> means the Securities Act of 1933,
          as amended.
        </Text>
        <Text style={s.indent}>
          <Text style={s.bold}>&quot;Standard Preferred Stock&quot;</Text> means the shares of the
          series of Preferred Stock issued to the investors investing new money in the Company in
          connection with the initial closing of the Equity Financing.
        </Text>

        {/* ── Section 3: Company Representations ──────────────── */}
        <Text style={s.sectionTitle}>3. Company Representations</Text>

        <Text style={s.subsectionTitle}>(a)</Text>
        <Text style={s.indent}>
          The Company is a corporation duly organized, validly existing, and in good standing under
          the laws of the state of Delaware, and has the power and authority to own, lease, and
          operate its properties and carry on its business as now conducted.
        </Text>

        <Text style={s.subsectionTitle}>(b)</Text>
        <Text style={s.indent}>
          The execution, delivery, and performance by the Company of this Safe is within the power
          of the Company and has been duly authorized by all necessary actions on the part of the
          Company. This Safe constitutes a legal, valid, and binding obligation of the Company,
          enforceable against the Company in accordance with its terms, except as limited by
          bankruptcy, insolvency, or other laws of general application relating to or affecting the
          enforcement of creditors&apos; rights generally and general principles of equity.
        </Text>

        <Text style={s.subsectionTitle}>(c)</Text>
        <Text style={s.indent}>
          The performance and consummation of the transactions contemplated by this Safe do not and
          will not: (i) violate any material judgment, statute, rule, or regulation applicable to
          the Company; (ii) result in the acceleration of any material indebtedness owed by the
          Company; or (iii) result in the creation or imposition of any lien on any property, asset,
          or revenue of the Company or the suspension, forfeiture, or nonrenewal of any material
          permit, license, or authorization applicable to the Company, its business, or operations.
        </Text>

        <Text style={s.subsectionTitle}>(d)</Text>
        <Text style={s.indent}>
          No consents or approvals are required in connection with the performance of this Safe,
          other than: (i) the Company&apos;s corporate approvals; (ii) any qualifications or filings
          under applicable securities laws; and (iii) necessary corporate approvals for the
          authorization of Capital Stock issuable pursuant to Section 1.
        </Text>

        {/* ── Section 4: Investor Representations ─────────────── */}
        <Text style={s.sectionTitle}>4. Investor Representations</Text>

        <Text style={s.subsectionTitle}>(a)</Text>
        <Text style={s.indent}>
          The Investor has full legal capacity, power, and authority to execute and deliver this
          Safe and to perform its obligations hereunder. This Safe constitutes valid and binding
          obligation of the Investor, enforceable in accordance with its terms, except as limited
          by bankruptcy, insolvency, or other laws of general application relating to or affecting
          the enforcement of creditors&apos; rights generally and general principles of equity.
        </Text>

        <Text style={s.subsectionTitle}>(b)</Text>
        <Text style={s.indent}>
          The Investor is an accredited investor as such term is defined in Rule 501 of Regulation
          D under the Securities Act of 1933, as amended. The Investor has been advised that this
          Safe and the underlying securities have not been registered under the Securities Act, or
          any state securities laws, and are being offered and sold pursuant to an exemption from
          such registration.
        </Text>

        <Text style={s.subsectionTitle}>(c)</Text>
        <Text style={s.indent}>
          The Investor is purchasing this Safe and the securities to be acquired by the Investor
          hereunder for its own account for investment, not as a nominee or agent, and not with a
          view to, or for resale in connection with, the distribution thereof, and the Investor has
          no present intention of selling, granting any participation in, or otherwise distributing
          the same.
        </Text>

        <Text style={s.subsectionTitle}>(d)</Text>
        <Text style={s.indent}>
          The Investor has had an opportunity to ask questions and receive answers from the Company
          regarding the terms and conditions of this Safe and the business, properties, prospects,
          and financial condition of the Company.
        </Text>

        <Text style={s.footer}>
          SAFE — Phosra, Inc. — {agreementDate}
        </Text>
      </Page>

      <Page size="LETTER" style={s.page}>
        {/* ── Section 5: Miscellaneous ────────────────────────── */}
        <Text style={s.sectionTitle}>5. Miscellaneous</Text>

        <Text style={s.subsectionTitle}>(a) Amendment.</Text>
        <Text style={s.indent}>
          Any provision of this Safe may be amended, waived, or modified by written consent of the
          Company and either (i) the Investor or (ii) the majority-in-interest of all then-outstanding
          SAFEs with the same &quot;Post-Money Valuation Cap&quot; and &quot;Discount Rate&quot; as this Safe
          (the &quot;Requisite Majority&quot;), provided that with the different consent specified for different
          SAFEs, each SAFE may be separately amended.
        </Text>

        <Text style={s.subsectionTitle}>(b) No Stockholder Rights.</Text>
        <Text style={s.indent}>
          The Investor is not entitled, as a Safe holder, to vote or receive dividends or be deemed
          the holder of Capital Stock for any purpose, nor will anything contained herein be
          construed to confer on the Investor, as such, any of the rights of a stockholder of the
          Company or any right to vote for the election of directors or upon any matter submitted to
          stockholders at any meeting thereof, or to give or withhold consent to any corporate
          action or to receive notice of meetings, or to receive subscription rights or otherwise.
        </Text>

        <Text style={s.subsectionTitle}>(c) Tax Treatment.</Text>
        <Text style={s.indent}>
          This Safe is intended to be treated as stock for U.S. federal and state income tax
          purposes. To the maximum extent permissible, the Company and the Investor will file all
          tax returns and will take all financial reporting and other positions in a manner
          consistent with such treatment.
        </Text>

        <Text style={s.subsectionTitle}>(d) Notices.</Text>
        <Text style={s.indent}>
          Any notice required or permitted by this Safe will be deemed sufficient when delivered
          personally or by overnight courier service or sent by email to the relevant address listed
          on the signature page, as subsequently modified by written notice.
        </Text>

        <Text style={s.subsectionTitle}>(e) Governing Law.</Text>
        <Text style={s.indent}>
          This Safe will be governed by and construed under the laws of the State of Delaware,
          without regard to the conflicts of law provisions of such jurisdiction.
        </Text>

        <Text style={s.subsectionTitle}>(f) Successors and Assigns.</Text>
        <Text style={s.indent}>
          The terms and conditions of this Safe will inure to the benefit of and be binding upon
          the respective successors and assigns of the parties. Neither the Company nor the Investor
          may assign this Safe or any rights under this Safe without the prior written consent of the
          other. Notwithstanding the foregoing, the Investor may assign this Safe to an affiliate of
          the Investor without the Company&apos;s consent.
        </Text>

        <Text style={s.subsectionTitle}>(g) Severability.</Text>
        <Text style={s.indent}>
          If one or more provisions of this Safe are held to be unenforceable under applicable law,
          the parties agree to renegotiate such provision in good faith. In the event that the
          parties cannot reach a mutually agreeable and enforceable replacement for such provision,
          then (i) such provision will be excluded from this Safe, (ii) the balance of this Safe
          will be interpreted as if such provision were so excluded and (iii) the balance of this
          Safe will be enforceable in accordance with its terms.
        </Text>

        <Text style={s.subsectionTitle}>(h) Entire Agreement.</Text>
        <Text style={s.indent}>
          This Safe comprises the entire agreement between the Company and the Investor with regard
          to the subject matter herein, and no party has relied on any other agreements or
          representations.
        </Text>

        <Text style={s.subsectionTitle}>(i) Counterparts.</Text>
        <Text style={s.indent}>
          This Safe may be executed in one or more counterparts, each of which will be deemed an
          original and all of which together will constitute one and the same instrument. Electronic
          signatures will be deemed original signatures for all purposes.
        </Text>

        {/* ── Signature Page ──────────────────────────────────── */}
        <Text style={s.sectionTitle}>SIGNATURE PAGE</Text>

        <Text style={s.paragraph}>
          IN WITNESS WHEREOF, the undersigned have caused this Safe to be duly executed and
          delivered as of {agreementDate}.
        </Text>

        <View style={s.signatureBlock}>
          <Text style={[s.bold, { marginBottom: 4 }]}>COMPANY:</Text>
          <Text style={{ marginBottom: 2 }}>Phosra, Inc., a Delaware corporation</Text>

          <View style={s.signatureLine} />
          <Text style={s.signatureLabel}>Name</Text>
          <Text style={s.signatureValue}>
            {data.companySignature || "Jake Klinvex"}
          </Text>

          <Text style={s.signatureLabel}>Title</Text>
          <Text style={s.signatureValue}>Chief Executive Officer</Text>

          {data.companySignedAt && (
            <>
              <Text style={s.signatureLabel}>Signed</Text>
              <Text style={s.signatureValue}>
                {fmtDate(data.companySignedAt)}
              </Text>
            </>
          )}
        </View>

        <View style={[s.signatureBlock, { marginTop: 30 }]}>
          <Text style={[s.bold, { marginBottom: 4 }]}>INVESTOR:</Text>

          <View style={s.signatureLine} />
          <Text style={s.signatureLabel}>Name</Text>
          <Text style={s.signatureValue}>{data.investorName}</Text>

          {data.investorCompany && (
            <>
              <Text style={s.signatureLabel}>Entity (if applicable)</Text>
              <Text style={s.signatureValue}>{data.investorCompany}</Text>
            </>
          )}

          <Text style={s.signatureLabel}>Email</Text>
          <Text style={s.signatureValue}>{data.investorEmail}</Text>

          <Text style={s.signatureLabel}>Purchase Amount</Text>
          <Text style={s.signatureValue}>{purchaseAmount}</Text>

          {data.investorSignedAt && (
            <>
              <Text style={s.signatureLabel}>Signed</Text>
              <Text style={s.signatureValue}>
                {fmtDate(data.investorSignedAt)}
              </Text>
            </>
          )}
        </View>

        <Text style={s.footer}>
          SAFE — Phosra, Inc. — {agreementDate}
        </Text>
      </Page>

      {/* ============================================================ */}
      {/*  Signing Certificate (only if investor has signed)            */}
      {/* ============================================================ */}
      {data.investorSignature && (
        <Page size="LETTER" style={s.certPage}>
          <Text style={s.certTitle}>Electronic Signing Certificate</Text>

          <Text style={[s.paragraph, { marginBottom: 16 }]}>
            This certificate confirms the electronic execution of the above SAFE agreement between
            Phosra, Inc. and {investorLine}.
          </Text>

          <View style={s.certDivider} />

          <Text style={[s.bold, { marginBottom: 8 }]}>Investor Signature</Text>
          <View style={s.certRow}>
            <Text style={s.certLabel}>Typed Legal Name:</Text>
            <Text style={s.certValue}>{data.investorSignature}</Text>
          </View>
          <View style={s.certRow}>
            <Text style={s.certLabel}>Signed At:</Text>
            <Text style={s.certValue}>
              {data.investorSignedAt
                ? new Date(data.investorSignedAt).toISOString()
                : "—"}
            </Text>
          </View>
          <View style={s.certRow}>
            <Text style={s.certLabel}>IP Address:</Text>
            <Text style={s.certValue}>{data.investorSignIp || "—"}</Text>
          </View>
          <View style={s.certRow}>
            <Text style={s.certLabel}>User Agent:</Text>
            <Text style={s.certValue}>{data.investorSignUa || "—"}</Text>
          </View>

          {data.companySignature && (
            <>
              <View style={s.certDivider} />

              <Text style={[s.bold, { marginBottom: 8 }]}>Company Countersignature</Text>
              <View style={s.certRow}>
                <Text style={s.certLabel}>Typed Legal Name:</Text>
                <Text style={s.certValue}>{data.companySignature}</Text>
              </View>
              <View style={s.certRow}>
                <Text style={s.certLabel}>Title:</Text>
                <Text style={s.certValue}>Chief Executive Officer</Text>
              </View>
              <View style={s.certRow}>
                <Text style={s.certLabel}>Signed At:</Text>
                <Text style={s.certValue}>
                  {data.companySignedAt
                    ? new Date(data.companySignedAt).toISOString()
                    : "—"}
                </Text>
              </View>
              <View style={s.certRow}>
                <Text style={s.certLabel}>IP Address:</Text>
                <Text style={s.certValue}>{data.companySignIp || "—"}</Text>
              </View>
            </>
          )}

          <View style={s.certDivider} />

          <Text style={[s.bold, { marginBottom: 8 }]}>Document Integrity</Text>
          <View style={s.certRow}>
            <Text style={s.certLabel}>Document Hash:</Text>
            <Text style={[s.certValue, { fontSize: 8 }]}>
              SHA-256: {data.documentHash || "—"}
            </Text>
          </View>
          <View style={s.certRow}>
            <Text style={s.certLabel}>Purchase Amount:</Text>
            <Text style={s.certValue}>{purchaseAmount}</Text>
          </View>
          <View style={s.certRow}>
            <Text style={s.certLabel}>Valuation Cap:</Text>
            <Text style={s.certValue}>{valuationCap}</Text>
          </View>

          <Text style={s.certNotice}>
            ESIGN ACT NOTICE: This agreement was executed electronically pursuant to the Electronic
            Signatures in Global and National Commerce Act (ESIGN Act, 15 U.S.C. § 7001 et seq.)
            and the Uniform Electronic Transactions Act (UETA). Electronic signatures have the same
            legal effect as handwritten signatures. By typing their legal name and affirming
            consent, each party has agreed to conduct this transaction electronically and
            acknowledges that their electronic signature is legally binding.
          </Text>

          <Text style={s.footer}>
            Electronic Signing Certificate — Phosra, Inc.
          </Text>
        </Page>
      )}
    </Document>
  )
}

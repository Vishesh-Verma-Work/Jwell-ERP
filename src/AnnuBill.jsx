import "./annu.css";
import { useState } from "react";

function AnnuBill() {
  const today = new Date();

  const localDate = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const [date, setDate] = useState(localDate);

  const [ghaaths, setGhaaths] = useState([
    { num: "", amt: "", date: "" },
  ]);

  const [showGaathDi, setShowGaathDi] = useState(false);

  const [gaathDi, setGaathDi] = useState("");

  const [bill, setBill] = useState(null);

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      const inputs = document.querySelectorAll(
        "input, select, textarea, button"
      );

      const index = Array.from(inputs).indexOf(e.target);

      const next = inputs[index + 1];

      if (next) next.focus();
    }
  };

  const formatDate = (d) => {
    if (!d) return "";

    const x = new Date(d);

    return `${String(x.getDate()).padStart(2, "0")}/${String(
      x.getMonth() + 1
    ).padStart(2, "0")}/${x.getFullYear()}`;
  };

  // ALL MONTHS = 30 DAYS
  const getDiff = (from, to) => {
    let d1 = new Date(from);
    let d2 = new Date(to);

    let y = d2.getFullYear() - d1.getFullYear();
    let m = d2.getMonth() - d1.getMonth();
    let d = d2.getDate() - d1.getDate();

    if (d < 0) {
      d += 30;
      m -= 1;
    }

    if (m < 0) {
      m += 12;
      y -= 1;
    }

    let totalMonths = y * 12 + m;

    // only if under 1 month
    if (totalMonths === 0 && d > 0 && d < 30) {
      totalMonths = 1;
      d = 0;
    }

    return {
      months: totalMonths,
      days: d,
      text: `${totalMonths}-${d}`,
    };
  };

  const calculateInterest = (amt, from, to) => {
    const diff = getDiff(from, to);

    const totalMonths = diff.months;
    const totalDays = diff.days;

    const totalMonthDecimal = totalMonths + totalDays / 30;

    const dateObj = new Date(from);

    const case1End = new Date("2025-01-31");
    const case2Start = new Date("2025-02-01");
    const case2End = new Date("2025-10-05");

    let totalInterest = 0;
    let lines = [];

    // CASE 1 → 1% COMPOUND YEARLY
    if (dateObj <= case1End) {
      let currentPrincipal = amt;

      let years = Math.floor(totalMonthDecimal / 12);

      let remainingMonthsDecimal = totalMonthDecimal % 12;

      let remainingMonths = Math.floor(remainingMonthsDecimal);

      let remainingDays = Math.round(
        (remainingMonthsDecimal - remainingMonths) * 30
      );

      for (let i = 0; i < years; i++) {
        let interest = Math.round(currentPrincipal * 0.12);

        totalInterest += interest;

        lines.push({
          amt: interest,
          text: `Int 1% 12-0`,
        });

        currentPrincipal += interest;
      }

      if (remainingMonths > 0 || remainingDays > 0) {
        let partialValue =
          remainingMonths + remainingDays / 30;

        let partialInterest = Math.round(
          currentPrincipal * 0.01 * partialValue
        );

        totalInterest += partialInterest;

        lines.push({
          amt: partialInterest,
          text: `Int 1% ${remainingMonths}-${remainingDays}`,
        });
      }
    }

    // CASE 2 → 1.25%
    else if (dateObj >= case2Start && dateObj <= case2End) {
      totalInterest = Math.round(
        amt * 0.0125 * totalMonthDecimal
      );

      lines.push({
        amt: totalInterest,
        text: "Int 5/4",
      });
    }

    // CASE 3 → 1.5%
    else {
      totalInterest = Math.round(
        amt * 0.015 * totalMonthDecimal
      );

      lines.push({
        amt: totalInterest,
        text: "Int 3/2",
      });
    }

    return {
      interest: totalInterest,
      lines,
      diffText: diff.text,
    };
  };

  const generateBill = () => {
    let principalTotal = 0;
    let interestTotal = 0;

    let calc = ghaaths.map((g) => {
      const amt = Number(g.amt || 0);

      principalTotal += amt;

      const result = calculateInterest(amt, g.date, date);

      interestTotal += result.interest;

      return {
        ...g,
        diff: result.diffText,
        lines: result.lines,
      };
    });

    const total = principalTotal + interestTotal;

    let finalAmount = total;

    if (showGaathDi) {
      finalAmount = Number(gaathDi || 0) - total;
    }

    setBill({
      calc,
      principalTotal,
      interestTotal,
      total,
      finalAmount,
    });
  };

  const downloadImage = async () => {
    const html2canvas = (await import("html2canvas")).default;

    const billArea = document.getElementById("billArea");

    if (!billArea) return;

    const canvas = await html2canvas(billArea, {
      scale: 3,
      backgroundColor: "#ffffff",
    });

    const link = document.createElement("a");

    link.download = "annu-bill.png";

    link.href = canvas.toDataURL();

    link.click();
  };

  return (
    <div className="annuContainer">
      <div className="annuForm">
        <h2>Annu Bill</h2>

        <h3>Date</h3>

        <input
          type="date"
          value={date}
          onKeyDown={handleEnter}
          onChange={(e) => setDate(e.target.value)}
        />

        <h3>गाँठ</h3>

        {ghaaths.map((g, i) => (
          <div className="annuRow" key={i}>
            <input
              type="number"
              placeholder="गाँठ नंबर"
              value={g.num}
              onKeyDown={handleEnter}
              onChange={(e) => {
                let arr = [...ghaaths];
                arr[i].num = e.target.value;
                setGhaaths(arr);
              }}
            />

            <input
              type="number"
              placeholder="Amount"
              value={g.amt}
              onKeyDown={handleEnter}
              onChange={(e) => {
                let arr = [...ghaaths];
                arr[i].amt = e.target.value;
                setGhaaths(arr);
              }}
            />

            <input
              type="date"
              value={g.date}
              onKeyDown={handleEnter}
              onChange={(e) => {
                let arr = [...ghaaths];
                arr[i].date = e.target.value;
                setGhaaths(arr);
              }}
            />
          </div>
        ))}

        <button
          onClick={() =>
            setGhaaths([
              ...ghaaths,
              { num: "", amt: "", date: "" },
            ])
          }
        >
          Add More
        </button>

        <h3>गाँठ दी?</h3>

        <select
          value={showGaathDi ? "yes" : "no"}
          onChange={(e) =>
            setShowGaathDi(e.target.value === "yes")
          }
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>

        {showGaathDi && (
          <input
            type="number"
            placeholder="गाँठ दी"
            value={gaathDi}
            onKeyDown={handleEnter}
            onChange={(e) => setGaathDi(e.target.value)}
          />
        )}

        <div className="btns">
          <button className="generateBtn" onClick={generateBill}>
            Generate Bill
          </button>

          <button className="downloadBtn" onClick={downloadImage}>
            Download
          </button>
        </div>

        {bill && (
          <div className="annuBill" id="billArea">
            <div className="line"></div>
            <h1>{formatDate(date)}</h1>
            <div className="line"></div>

            {bill.calc.map((c, i) => (
              <div key={i} className="entry">
                <div>
                  {c.num} नं {c.amt} ={" "}
                  {formatDate(c.date)} {c.diff}
                </div>

                {c.lines.map((l, idx) => (
                  <div className="intLine" key={idx}>
                    {l.amt} = {l.text}
                  </div>
                ))}
              </div>
            ))}

            <div className="line"></div>

            <div className="mainTotal">{bill.total}</div>
            <div className="line"></div>

            <div className="bottomSection">
              <div className="leftBox">
                <div>{bill.principalTotal} = असल</div>

                <div>{bill.interestTotal} = ब्याज</div>

                <div className="line"></div>

                <div>{bill.total}</div>
                <div className="line"></div>
              </div>

              {showGaathDi && (
                <div className="rightBox">
                  <div>{gaathDi} = गाँठ दी</div>

                  <div>{bill.total} = कुल आपके</div>

                  <div className="line"></div>

                  <div>
                    {Math.abs(bill.finalAmount)} ={" "}
                    <span className="finalText">
                      {bill.finalAmount >= 0
                        ? "आप दीजिएगा"
                        : "नगद दिए"}
                    </span>
                  </div>

                  <div className="line"></div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnnuBill;
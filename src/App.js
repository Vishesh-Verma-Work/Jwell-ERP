import "./App.css";
import AnnuBill from "./AnnuBill";
import { useState, useRef } from "react";
import html2canvas from "html2canvas";

function App() {
  const [billType, setBillType] = useState(null);

  const today = new Date();
  const localDate = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const [date, setDate] = useState(localDate);

  const [ghaaths, setGhaaths] = useState([
    { num: "", amt: "", date: "" },
  ]);

  const [adjust, setAdjust] = useState({
    type: "jama",
    amt: "",
    date: "",
  });

  const [diAmount, setDiAmount] = useState("");

  const [diList, setDiList] = useState([
    { num: "", amt: "", desc: "" },
  ]);

  const [bill, setBill] = useState(null);

  const refs = useRef([]);

  // ✅ ENTER FIX (GLOBAL ORDER)
  const handleEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const form = e.target.form || document;
      const index = Array.from(form.querySelectorAll("input,select,textarea"))
        .indexOf(e.target);

      const next = form.querySelectorAll("input,select,textarea")[index + 1];
      if (next) next.focus();
    }
  };

  const formatDate = (d) => {
    if (!d) return "";
    let x = new Date(d);
    return `${String(x.getDate()).padStart(2, "0")}/${String(
      x.getMonth() + 1
    ).padStart(2, "0")}/${x.getFullYear()}`;
  };

  const getDiff = (from, to) => {
    let d1 = new Date(from);
    let d2 = new Date(to);

    let y = d2.getFullYear() - d1.getFullYear();
    let m = d2.getMonth() - d1.getMonth();
    let d = d2.getDate() - d1.getDate();

    let totalMonths = y * 12 + m;

    if (d < 0) {
      totalMonths -= 1;
      d += 30;
    }

    return `${totalMonths}-${d}`;
  };

  const getInt = (amt, from, to) => {
    let diff = getDiff(from, to);
    let [m, d] = diff.split("-").map(Number);
    let months = m + d / 30;
    return Math.round(amt * 0.01 * months);
  };

  const generate = () => {
    let total = 0;

    let calc = ghaaths.map((g) => {
      let int = getInt(Number(g.amt), g.date, date);
      let diff = getDiff(g.date, date);

      total += Number(g.amt) + int;

      return { ...g, int, diff };
    });

    let afterAdjust = total;

    if (adjust.amt) {
      if (adjust.type === "jama") afterAdjust -= Number(adjust.amt);
      else afterAdjust += Number(adjust.amt);
    }

    let final = afterAdjust;

    if (diAmount) final -= Number(diAmount);

    setBill({ calc, total, afterAdjust, final });
  };

  // ✅ IMAGE DOWNLOAD (NO WHITE SPACE)
  const downloadImage = async () => {
    const bill = document.getElementById("billArea");

    const canvas = await html2canvas(bill, {
      backgroundColor: null,
      scale: 3,
    });

    const link = document.createElement("a");
    link.download = "bill.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="container">
      {!billType ? (
        <div className="choiceBox">
          <h2>Select Bill Type</h2>
          <button onClick={() => setBillType("yadav")}>Yadav Bill</button>
          <button onClick={() => setBillType("annu")}>Annu Bill</button>
        </div>
      ) : billType === "yadav" ? (
        <div className="form">
          <h3>तारीख</h3>
          <input
            type="date"
            value={date}
            onKeyDown={handleEnter}
            onChange={(e) => setDate(e.target.value)}
          />

          <h3>घाट</h3>

          {ghaaths.map((g, i) => (
            <div key={i} className="row">
              <input
                placeholder="नंबर"
                onKeyDown={handleEnter}
                value={g.num}
                onChange={(e) => {
                  let arr = [...ghaaths];
                  arr[i].num = e.target.value;
                  setGhaaths(arr);
                }}
              />

              <input
                placeholder="अमाउंट"
                onKeyDown={handleEnter}
                value={g.amt}
                onChange={(e) => {
                  let arr = [...ghaaths];
                  arr[i].amt = e.target.value;
                  setGhaaths(arr);
                }}
              />

              <input
                type="date"
                onKeyDown={handleEnter}
                value={g.date}
                onChange={(e) => {
                  let arr = [...ghaaths];
                  arr[i].date = e.target.value;
                  setGhaaths(arr);
                }}
              />
            </div>
          ))}

          <button onClick={() => setGhaaths([...ghaaths, { num: "", amt: "", date: "" }])}>
            + Add More
          </button>

          <h3>जमा / शेष</h3>

          <select onKeyDown={handleEnter}
            value={adjust.type}
            onChange={(e) =>
              setAdjust({ ...adjust, type: e.target.value })
            }>
            <option value="jama">जमा</option>
            <option value="reh">शेष</option>
          </select>

          <input
            placeholder="अमाउंट"
            onKeyDown={handleEnter}
            value={adjust.amt}
            onChange={(e) =>
              setAdjust({ ...adjust, amt: e.target.value })
            }
          />

          <input
            type="date"
            onKeyDown={handleEnter}
            value={adjust.date}
            onChange={(e) =>
              setAdjust({ ...adjust, date: e.target.value })
            }
          />

          <h3>घाट दी</h3>

          <input
            placeholder="कुल अमाउंट"
            onKeyDown={handleEnter}
            value={diAmount}
            onChange={(e) => setDiAmount(e.target.value)}
          />

          {diList.map((d, i) => (
            <div key={i} className="row">
              <input
                placeholder="नंबर"
                onKeyDown={handleEnter}
                value={d.num}
                onChange={(e) => {
                  let arr = [...diList];
                  arr[i].num = e.target.value;
                  setDiList(arr);
                }}
              />

              <input
                placeholder="अमाउंट"
                onKeyDown={handleEnter}
                value={d.amt}
                onChange={(e) => {
                  let arr = [...diList];
                  arr[i].amt = e.target.value;
                  setDiList(arr);
                }}
              />

              <input
                placeholder="विवरण"
                onKeyDown={handleEnter}
                value={d.desc}
                onChange={(e) => {
                  let arr = [...diList];
                  arr[i].desc = e.target.value;
                  setDiList(arr);
                }}
              />
            </div>
          ))}

          <button onClick={() => setDiList([...diList, { num: "", amt: "", desc: "" }])}>
            + Add Item
          </button>

          <br /><br />

          <button className="gen" onClick={generate}>
            Generate Bill
          </button>

          <button className="print" onClick={downloadImage}>
            Download Image
          </button>

          {bill && (
            <div className="bill" id="billArea">
              <h2>{formatDate(date)}</h2>

              {bill.calc.map((c, i) => (
                <div key={i}>
                  {c.num} नं {c.amt} = {formatDate(c.date)} {c.diff}
                  <br />
                  {c.int} = Int
                </div>
              ))}

              <div className="line"></div>
              <div>{bill.total}</div>

              {adjust.amt && (
                <>
                  <div>
                    {adjust.amt} ={" "}
                    {adjust.type === "jama"
                      ? "हमारे जमा थे"
                      : "आपके शेष थे"}{" "}
                    {formatDate(adjust.date)}
                  </div>
                  <div className="line"></div>
                  <div>{bill.afterAdjust}</div>
                </>
              )}

              {diAmount && (
                <>
                  <div>{diAmount} = घाट दी</div>
                  <div className="line"></div>
                  <div>{bill.final}</div>
                </>
              )}

              <div>
                {bill.final} ={" "}
                {bill.final >= 0
                  ? "आपके शेष रहे"
                  : "हमारे जमा रहे"}
              </div>

              <br />
              <div>घाट दी</div>

              {diList.map((d, i) => (
                <div key={i}>
                  {d.num} नं {d.amt} = {d.desc}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <AnnuBill />
      )}
    </div>
  );
}

export default App;
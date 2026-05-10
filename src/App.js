import "./App.css";
import AnnuBill from "./AnnuBill";
import { useState, useRef } from "react";

function App() {
  
  const [billType, setBillType] = useState(null);


  const downloadImage = async () => {
    const html2canvas = (await import("html2canvas")).default;

    const bill = document.getElementById("billArea");
    if (!bill) return;

    const canvas = await html2canvas(bill, {
      backgroundColor: null,
      scale: 3,
    });

    const link = document.createElement("a");
    link.download = "bill.png";
    link.href = canvas.toDataURL();
    link.click();
  };

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


  const handleEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const inputs = document.querySelectorAll("input,select,textarea");
      const index = Array.from(inputs).indexOf(e.target);
      const next = inputs[index + 1];
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
          <h3>Today's Date</h3>
          <input
            type="date"
            value={date}
            onKeyDown={handleEnter}
            onChange={(e) => setDate(e.target.value)}
          />

          <h3>Gaath Details</h3>

          {ghaaths.map((g, i) => (
            <div key={i} className="row">
              <input
  placeholder="Gaath Number"
  inputMode="numeric"
  pattern="[0-9]*"
  onKeyDown={handleEnter}
  value={g.num}
  onChange={(e) => {
    let value = e.target.value.replace(/[^0-9]/g, ""); // only numbers
    let arr = [...ghaaths];
    arr[i].num = value;
    setGhaaths(arr);
  }}
/>

              <input
  placeholder="Amount"
  inputMode="numeric"
  pattern="[0-9]*"
  onKeyDown={handleEnter}
  value={g.amt}
  onChange={(e) => {
    let value = e.target.value.replace(/[^0-9]/g, ""); // only numbers
    let arr = [...ghaaths];
    arr[i].amt = value;
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
            Add More
          </button>

          <h3>जमा / शेष</h3>

          <select
            onKeyDown={handleEnter}
            value={adjust.type}
            onChange={(e) =>
              setAdjust({ ...adjust, type: e.target.value })
            }
          >
            <option value="jama">जमा</option>
            <option value="reh">शेष</option>
          </select>

        <input
  placeholder="Amount"
  inputMode="numeric"
  pattern="[0-9]*"
  onKeyDown={handleEnter}
  value={adjust.amt}
  onChange={(e) =>
    setAdjust({
      ...adjust,
      amt: e.target.value.replace(/[^0-9]/g, "") // only numbers
    })
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

          <h3>गाँठ दी</h3>

          <input
  type="number"
  inputMode="numeric"
  pattern="[0-9]*"
  placeholder="Amount"
  onKeyDown={handleEnter}
  value={diAmount}
  onChange={(e) =>
    setDiAmount(e.target.value.replace(/[^0-9]/g, ""))
  }
/>

          {diList.map((d, i) => (
            <div key={i} className="row">
              <input
  type="number"
  inputMode="numeric"
  pattern="[0-9]*"
  placeholder="Gaath Number"
  onKeyDown={handleEnter}
  value={d.num}
  onChange={(e) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    let arr = [...diList];
    arr[i].num = value;
    setDiList(arr);
  }}
/>

              <input
  type="number"
  inputMode="numeric"
  pattern="[0-9]*"
  placeholder="Amount"
  onKeyDown={handleEnter}
  value={d.amt}
  onChange={(e) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    let arr = [...diList];
    arr[i].amt = value;
    setDiList(arr);
  }}
/>

              <input
                placeholder="Deatils"
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
            Add Item
          </button>

          <br /><br />

          
          <br/>
          {bill && (
            <div className="bill" id="billArea">
              <h2>{formatDate(date)}</h2>

              {bill.calc.map((c, i) => (
                <div key={i}>
                  {c.num} नं {c.amt} = {formatDate(c.date)} {c.diff}
                  <br />
                  &nbsp;
                  &nbsp;
                  &nbsp;
                  &nbsp;
                  &nbsp;
                  &nbsp;
                  &nbsp;
                  {c.int} = Int
                </div>
              ))}

              <div className="line"></div>
              
              <div>
                &nbsp;
                  &nbsp;
                  &nbsp;
                  &nbsp;
                  &nbsp;
                  &nbsp;
                  &nbsp;
                {bill.total}</div>

              {adjust.amt && (
                <>
                
                  <div>
                    &nbsp;
                  &nbsp;
                  &nbsp;
                  &nbsp;
                  &nbsp;
                  &nbsp;
                  &nbsp;
                    {adjust.amt} ={" "}
                    {adjust.type === "jama"
                      ? "हमारे जमा थे"
                      : "आपके शेष थे"}{" "}
                    {formatDate(adjust.date)}
                  </div>
                  <div className="line"></div>
                  <div>
                    &nbsp;
                  &nbsp;
                  &nbsp;
                  &nbsp;
                  &nbsp;
                  &nbsp;
                  &nbsp;
                    {bill.afterAdjust}</div>
                </>
              )}

              {diAmount && (
                <>
                
                  <div>
                    &nbsp;
                  &nbsp;
                  &nbsp;
                  &nbsp;
                  &nbsp;
                  &nbsp;
                  &nbsp;
                  {diAmount} = गाँठ दी</div>
                  <div className="line"></div>
                  <div>
                    &nbsp;
                  &nbsp;
                  &nbsp;
                  &nbsp;
                  &nbsp;
                  &nbsp;
                  &nbsp;
                    {bill.final}</div>
                </>
              )}

              <div>
                &nbsp;
                  &nbsp;
                  &nbsp;
                  &nbsp;
                  &nbsp;
                  &nbsp;
                  &nbsp;
                {bill.final} ={" "}
                {bill.final >= 0
                  ? "आपके शेष रहे"
                  : "हमारे जमा रहे"}
              </div>

              <br />
              <div className="line"></div>
              <div>गाँठ दी</div>

              {diList.map((d, i) => (
                <div key={i}>
                  {d.num} नं {d.amt} = {d.desc}
                </div>
              ))}
              <div className="line"></div>
              <div>
                &nbsp;
                &nbsp;
                &nbsp;
                &nbsp;
                &nbsp;
                &nbsp;
                &nbsp;
                {diList.reduce((sum, item) => sum + Number(item.amt || 0), 0) } = 
              </div>
              <div className="line"></div>
            </div>
          )}
          <br/>
          <button className="gen" onClick={generate}>
            Generate Bill
          </button>

          <button className="print" onClick={downloadImage}>
            Download Image
          </button>
        </div>
      ) : (
        <AnnuBill />
      )}
    </div>
  );
}

export default App;
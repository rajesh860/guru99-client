import { useEffect, useState } from "react";

export const useOdds = (value: string) => {
  const [odds, setOdds] = useState<any>(null);
  const [pnl, setPnl] = useState<{ [x: string]: number }>({});
  const [betPlace, setBetPlace] = useState(false);
  const token = localStorage.getItem("client-token");

  const slug = (value || "").toString().replace(/^meta-/, "");
  useEffect(() => {
    const timer = setInterval(() => {
      slug &&
        fetch(
          `${import.meta.env.VITE_ODDS_API}/betfair_api/casino/data/meta-` + slug,
        )
          .then((res) => res.json())
          .then((res) => {
            if (Array.isArray(res?.bf)) {
              convertBfToT2(res.data);
            }
            if (Array.isArray(res?.t2)) {
              if (Array.isArray(res?.t3)) {
                res.t2 = [...res.t2, ...res.t3];
              }
              res.t2BySid = {};
              res?.t2?.forEach((item: any) => {
                if (!item.nation && item.nat) {
                  item.nation = item.nat;
                }
                item.gstatus =
                  Number(item.gstatus) === 1
                    ? true
                    : Number(item.gstatus) === 0
                      ? false
                      : item.gstatus;
                item.pnl = pnl[item.sid] || 0;
                res.t2BySid[item.sid] = item;
              });
            }
            setOdds(res);
          });
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [pnl, slug]);

  useEffect(() => {
    return () => setOdds(null);
  }, [slug])

  // Liability API removed - pnl state will remain empty
  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     Number(odds?.t1?.[0]?.mid) &&
  //       fetch(
  //         `${import.meta.env.VITE_API_BASE_URL}/casino/liability`,
  //         {
  //           body: JSON.stringify({
  //             roundId: odds?.t1?.[0].mid,
  //           }),
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //             "Content-Type": "application/json",
  //           },
  //           method: "POST",
  //         }
  //       )
  //         .then((res) => res.json())
  //         .then((res) => {
  //           if (res.data) {
  //             const pnl: { [x: string]: number } = {};
  //             let i: { sid: string; liability: number };
  //             for (i of res.data) {
  //               pnl[i.sid] = i.liability;
  //             }
  //             setPnl(pnl);
  //           } else {
  //             setPnl({});
  //           }
  //         });

  //   }, 2000)
  //   return () => {
  //     clearInterval(timer);
  //   };
  // }, [betPlace, odds?.t1?.[0].mid]);
  
  return { odds, setBetPlace, pnl };
};


const convertBfToT2 = (oddData: any) => {
  if (oddData?.data?.bf && oddData?.data?.bf?.length > 0) {
    oddData.data.bf.forEach((bfElement, index) => {
      const t2Obj = {
        mid: bfElement.marketId,
        sid: bfElement.sectionId,
        max: +bfElement.max,
        min: +bfElement.min,
        gstatus: bfElement.gstatus,
        gtype: bfElement.gameType,
        nation: bfElement.nation,
        nat: bfElement.nation,
        rate: "",
        b1: `${bfElement.b1}`,
        l1: `${bfElement.l1}`,
        bs1: `${bfElement.bs1}`,
        ls1: `${bfElement.ls1}`,
      };
      const t1Obj: any = {
        mid: bfElement.marketId,
        autotime: bfElement.UpdateTime,
        gtype: bfElement.gameType,
        remark: bfElement.remark,
        max: +bfElement.max,
        min: +bfElement.min,
      };

      if (index === 0) {
        t1Obj.C1 = bfElement.C1;
        t1Obj.C3 = bfElement.C2;
        t1Obj.C5 = bfElement.C3;
      }
      if (index === 1) {
        t1Obj.C2 = bfElement.C1;
        t1Obj.C4 = bfElement.C2;
        t1Obj.C6 = bfElement.C3;
      }
      if (Array.isArray(oddData.data.t1)) {
        const newt1Obj = [{ ...oddData.data.t1?.[0], ...t1Obj }];
        oddData.data.t1 = newt1Obj;
      } else {
        oddData.data.t1 = [t1Obj];
      }

      if (Array.isArray(oddData.data.t2)) {
        oddData.data.t2.push(t2Obj);
      } else {
        oddData.data.t2 = [t2Obj];
      }
    });
  }
}
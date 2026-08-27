
export const categories = [
    { name: "Total Dispatch", info: "Total number of items dispatched" },
    { name: "Production", info: "Total number of items produced" },
    { name: "Packing", info: "Total number of items packed" },
    { name: "Sales", info: "Total sales amount in dollars" },
];


export const materialCodeOptions = [...new Set([
    "GLOVES3AFTBL02",
    "GLOVES3BFTBL01",
    "GLOVES3BFTBL02",
    "GLOVES3CFTBL01",
    "GLOVES3DFTBL01",
    "GLOVES3DFTBL02",
    "GLOVES3EFTBL01",
    "GLOVES3EFTBL02",
    "GLOVES3AFTBU01",
    "GLOVES3BFTBU01",
    "GLOVES3BFTBU02",
    "GLOVES3CFTBU01",
    "GLOVE3CFTBU02",
    "GLOVES3DFTBU01",
    "GLOVE3DFTBU02",
    "GLOVES3EFTBU01",
    "GLOVES3EFTBU02",
    "GLOVES3AFTVB01",
    "GLOVES3AFTVB02",
    "GLOVES3BFTVB01",
    "GLOVES3BFTVB02",
    "GLOVES3CFTVB01",
    "GLOVES3CFTVB02",
    "GLOVES3DFTVB01",
    "GLOVES3DFTVB02",
    "GLOVES3AFTCB01",
    "GLOVES3BFTCB01",
    "GLOVES3BFTCB02",
    "GLOVES3CFTCB01",
    "GLOVES3CFTCB02",
    "GLOVE3DFTCB01",
    "GLOVES3DFTCB02",
    "GLOVES3EFTCB01",
    "GLOVES3EFTCB02",
    "GLOVES3BFUCB01",
    "GLOVES3BFUCB02",
    "GLOVES3DFUCB02",
    "GLOVES3CFUBL01",
    "GLOVES3CFUBL02",
    "GLOVES3DFUBL01",
    "GLOVES3DFUBL02",
    "GLOVES3BFUBU01",
    "GLOVES3BFUBU02",
    "GLOVES3CFUBU02",
    "GLOVES3DDTBL02",
    "GLOVES3DDTBU01",
    "GLOVES3DDTBU02",
    "GLOVES4BFTBL01",
    "GLOVES4BFTBL02",
    "GLOVES4CFTBL01",
    "GLOVE4DFTBL01",
    "GLOVE4DFTBL02",
    "GLOVE4EFTBL01",
    "GLOVE4EFTBL02",
    "GLOVES4BFTBU01",
    "GLOVES4BFTBU02",
    "GLOVES4CFTBU01",
    "RGLOVES4CFTBU01",
    "GLOVES4CFTBU02",
    "GLOVE4DFTBU01",
    'RGLOVE4DFTBU01',
    "GLOVES4DFTBU02",
    "GLOVES4EFTBU01",
    "GLOVES4EFTBU02",
    "GLOVES4AFTVB01",
    "GLOVES4AFTVB02",
    "GLOVES4BFTVB01",
    "GLOVES4BFTVB02",
    "GLOVES4CFTVB01",
    "GLOVES4CFTVB02",
    "GLOVES4DFTVB01",
    "GLOVES4DFTVB02",
    "GLOVES4EFTVB01",
    "GLOVES4EFTVB02",
    "GLOVES4CFUBL01",
    "GLOVES4CFUBL02",
    "GLOVES4DFUBL01",
    "GLOVES4DDTBL01",
    "GLOVES4DDTBL02",
    "GLOVES4DDTBU01",
    "NMG4DFTBL01",
    "GLOVES5BFTBL01",
    "GLOVES5CFTBL01",
    "GLOVES5CFTBL02",
    "GLOVES5DFTBL01",
    "GLOVES5DFTBL02",
    "GLOVES5BFTBU01",
    "GLOVES5CFTBU01",
    "RGLOVES5CFTBU01",
    "GLOVES5CFTBU02",
    "GLOVES5DFTBU01",
    "RGLOVES5DFTBU01",
    "GLOVES5DFTBU02",
    "GLOVES5EFTBU01",
    "GLOVES5EFTBU02",
    "GLOVES5FFTBU02",
    "GLOVES5BFUBL01",
    "GLOVES5CFUBU01",
    "GLOVES6CDTBL01",
    "GLOVES6BDTBL01",
    "GLOVES6BDTBL02",
    "GLOVES6FDTBL01",
    "GLOVES6GDTBL01",
    "GLOVES6DFTBL01",
    "GLOVES6CFTBL02",
    "GLOVES6EFTBL02",
    "GLOVES6FFTBL01",
    "GLOVES6BFTBU01",
    "GLOVES6CFTBU01",
    "GLOVES6CFTBU02",
    "GLOVES6DFTBU01",
    "GLOVES6DFTBU02",
    "GLOVES6EFTBU01",
    "GLOVES6EFTBU02",
    "GLOVES6DFUBL01",
    "GLOVES6BFUBL01",
    "GLOVES6DFUBU01",
    "GLOVES6DDTOR01",
    "GLOVES6DDTOR02",
    "GLOVES6EDTOR01",
    "GLOVES6FDTOR01",
    "GLOVES7DDTBL02",
    "GLOVES7CDTBL01",
    "GLOVES7EDTBL01",
    "GLOVES7FDTBL02",
    "GLOVES7DDTOR02",
    "GLOVES7EDTOR01",
    "GLOVES7EDTOR02",
    "GLOVES7DDTOR01",
    "GLOVES7DDTOR02",
    "GLOVES7FDTOR01",
    "GLOVES7FDTOR02",
    "GLOVES7CDTOR01",
    "GLOVES7CDTOR02",
    "GLOVES7BFTBL01",
    "GLOVES7CFTBL01",
    "GLOVES7DFTBL01",
    "GLOVES7EFTBL01",
    "GLOVES7DFUBL01",
    "GLOVES7CFUBL01",
    "GLOVES7BFUBL01",
    "GLOVES7EFUBL01",
    "GLOVES8DDTBL01",
    "GLOVES8EDTBL01",
    "GLOVES8DDTOR01",
    "GLOVES8DDTOR02",
    "GLOVES8EDTOR01",
    "GLOVES8EDTOR02",
    "GLOVES8FDTOR01",
    "GLOVES8FDTOR02",
    "GLOVES8GDTOR01",
    "GLOVES8GDTOR02",
    "GLOVES8CFUBL01",
    "GLOVES3DFTWH01",
    "GLOVES3CFTWH01",
    "GLOVES3BFTWH01"
])]


export const materialCodeForProduction = [
    "GLOVES3AFTBL01",
    "GLOVES3BFTBL01",
    "GLOVES3CFTBL01",
    "GLOVES3DFTBL01",
    "GLOVES3EFTBL01",
    "GLOVES3AFTBU01",
    "GLOVES3BFTBU01",
    "GLOVES3CFTBU01",
    "GLOVE3CFTBU01",
    "GLOVES3DFTBU01",
    "GLOVE3DFTBU01",
    "GLOVES3EFTBU01",
    "GLOVES3AFTCB01",
    "GLOVES3BFTCB01",
    "GLOVES3CFTCB01",
    "GLOVE3DFTCB01",
    "GLOVES3EFTCB01", ,
    "GLOVES3AFTVB01",
    "GLOVES3BFTVB01",
    "GLOVES3CFTVB01",
    "GLOVES3DFTVB01",
    "GLOVES3EFTVB01",
    "GLOVES3BFUCB01",
    "GLOVES3DFUCB01",
    "GLOVES3CFUBL01",
    "GLOVES3DFUBL01",
    "GLOVES3BFUBU01",
    "GLOVES3CFUBU01",
    "GLOVES3DDTBL01",
    "GLOVES3DDTBU01",
    "GLOVES4BFTBL01",
    "GLOVES4CFTBL01",
    "GLOVE4DFTBL01",
    "GLOVE4EFTBL01",
    "GLOVES4BFTBU01",
    "GLOVES4CFTBU01",
    "GLOVE4DFTBU01",
    "GLOVES4DFTBU01",
    "GLOVES4EFTBU01",
    "GLOVES4AFTVB01",
    "GLOVES4BFTVB01",
    "GLOVES4CFTVB01",
    "GLOVES4DFTVB01",
    "GLOVES4EFTVB01",
    "GLOVES4CFUBL01",
    "GLOVES4DFUBL01",
    "GLOVES4DDTBL01",
    "GLOVES4DDTBU01",
    "NMG4DFTBL01",
    "GLOVES5BFTBL01",
    "GLOVES5CFTBL01",
    "GLOVES5DFTBL01",
    "GLOVES5BFTBU01",
    "GLOVES5CFTBU01",
    "GLOVES5DFTBU01",
    "GLOVES5EFTBU01",
    "GLOVES5FFTBU01",
    "GLOVES5BFUBL01",
    "GLOVES5CFUBU01",
    "GLOVES6CDTBL01",
    "GLOVES6BDTBL01",
    "GLOVES6FDTBL01",
    "GLOVES6GDTBL01",
    "GLOVES6DFTBL01",
    "GLOVES6CFTBL01",
    "GLOVES6EFTBL01",
    "GLOVES6FFTBL01",
    "GLOVES6BFTBU01",
    "GLOVES6CFTBU01",
    "GLOVES6DFTBU01",
    "GLOVES6EFTBU01",
    "GLOVES6DFUBL01",
    "GLOVES6BFUBL01",
    "GLOVES6DFUBU01",
    "GLOVES6DDTOR01",
    "GLOVES6EDTOR01",
    "GLOVES6FDTOR01",
    "GLOVES7DDTBL01",
    "GLOVES7CDTBL01",
    "GLOVES7EDTBL01",
    "GLOVES7FDTBL01",
    "GLOVES7DDTOR01",
    "GLOVES7EDTOR01",
    "GLOVES7FDTOR01",
    "GLOVES7CDTOR01",
    "GLOVES7BFTBL01",
    "GLOVES7CFTBL01",
    "GLOVES7DFTBL01",
    "GLOVES7EFTBL01",
    "GLOVES7DFUBL01",
    "GLOVES7CFUBL01",
    "GLOVES7BFUBL01",
    "GLOVES7EFUBL01",
    "GLOVES8DDTBL01",
    "GLOVES8EDTBL01",
    "GLOVES8DDTOR01",
    "GLOVES8EDTOR01",
    "GLOVES8FDTOR01",
    "GLOVES8GDTOR01",
    "GLOVES8CFUBL01",
    "GLOVES3DFTWH01",
    "GLOVES3CFTWH01",
    "GLOVES3BFTWH01"
];


const sizeMap = {
    A: "Extra Small",
    B: "Small",
    C: "Medium",
    D: "Large",
    E: "Extra Large",
};

export const textureMap = {
    FT: "Finger Texture",
    FU: "Fully Texture",
    DT: "Diamond Texture",
};

export const colorMap = {
    BL: "Black",
    BU: "Blue",
    CB: "Cobalt Blue",
    VB: "Voilet Blue",
    OR: "Orange",
    WH: "White",
};

const gradeMap = {
    "01": "A",
    "02": "B",
};

// Function to parse material code
export const parseMaterialCode = (code) => {
    let codeLength = code.length;
    return {
        materialCode: code,
        mil: `${code[codeLength - 8]}`,
        size: sizeMap[code[codeLength - 7]] || "Unknown",
        texture: textureMap[code.substring(codeLength - 6, codeLength - 4)] || "Unknown",
        color: colorMap[code.substring(codeLength - 4, codeLength - 2)] || "Unknown",
        grade: gradeMap[code.substring(codeLength - 2)] || "Unknown",
    };
};



export const gradeOptions = ["A", "B", "Non moving"];

// export const packingTypeOptions = [
//     "Box packing",
//     "Poly packing",
//     "50 golves",
//     "100 gloves",
// ];

export const packingTypeOptions = ["Box packing", "Poly packing"];

export const boxOptions = [50, 100];

export const polyOptions = [25, 50, 100, 150, 200];

export const getNormalizedDate = (date) => {
    const dateObj = new Date(date); // ✅ convert string to Date object safely
    const year = dateObj.getFullYear().toString();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const day = dateObj.getDate().toString().padStart(2, "0");
    return { year, month, day };
};



export const isValidBatchId = (batchId) => {
    const regex = /^\d{2}[a-l](0[1-9]|[12][0-9]|3[01])[dn]$/;
    return regex.test(batchId);
};

// const getBatchIdOptions = async () => {
//     try {
//         const res = await fetch(`${API_BASE_URL}/admin/fetchBatchStockData`);
//         const jsonData = await res.json();
//         const actualData = jsonData.data;
//         const batchIds = actualData.map((data) => data.batchId);
//         // console.log(`batchData", batchIds);
//         return batchIds;
//     }
//     catch (error) {
//         console.log(error);
//         return [];
//     }
// }


// getListofBatchId();

// export const batchIdOptions = await getBatchIdOptions();




// console.log("batchIdOptions", batchIdOptions);


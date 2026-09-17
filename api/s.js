export default async function handler(req, res) {
// CORS headers - Ab GET aur POST dono ko handle karega properly
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle Preflight OPTIONS request (CORS safety ke liye)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // URL parameters se ID nikalna (?id=...)
        const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
        let incomingId = searchParams.get('id');

        if (!incomingId) {
            return res.status(200).json({ authorized: false, error: "ID parameters clear nahi hain" });
        }

        const projectID = "reactions-maker-site";
        const dbURL = `https://${projectID}-default-rtdb.firebaseio.com/sky.json`;

        // Bina kisi package ke direct native fetch use kiya
        const response = await fetch(dbURL);
        
        if (!response.ok) {
            return res.status(200).json({ authorized: false, error: "Firebase connection issue" });
        }

        const allUsers = await response.json();
        let isRegisteredUser = false;

        if (allUsers) {
            // Poore object ko depth mein loop kiya jo aapne format diya tha
            for (let key in allUsers) {
                if (allUsers[key] && String(allUsers[key].id) === String(incomingId).trim()) {
                    if (allUsers[key].status === "active") {
                        isRegisteredUser = true;
                    }
                    break;
                }
            }
        }

        // ─── UPGRADE LOGIC HERE ───
        if (isRegisteredUser) {
            // Agar user active (true) hai, to sirf "F" string return hogi bina JSON format ke
            res.setHeader('Content-Type', 'text/plain');
            return res.status(200).send("F");
        } else {
            // Agar user false hai, to standard false JSON return hoga
            return res.status(200).json({ authorized: false });
        }

    } catch (error) {
        return res.status(200).json({ authorized: false, error: error.message });
    }
}

const fs = require('fs');
const content = fs.readFileSync('/Users/sanketpaithankar/Documents/autopane/AutoGlassProFrontend/src/components/Customers/CustomersRoot.jsx', 'utf8');
if (content.includes('Modal.confirm')) {
    console.log("Modal confirm is present");
}

exports.getDate = function () {

    const today = new Date();
    const options = {
        weekday: "short",
        day: "numeric",
        month: "short",
        // year: "numeric"
    };
    return today.toLocaleDateString("en-IN", options);

}

module.exports.getDay = getDay;
function getDay() {

    const today = new Date();
    const options = {
        weekday: "long",
        
    };
    return today.toLocaleDateString("en-IN", options);

}

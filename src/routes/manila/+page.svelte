<script>
// Configuration 
const eventName = "Daydream";
const eventLocation = "Manila";
const eventAddress = "TBA";
// These two are optional
// const directionsURL = "https://www.google.com/maps/search/1600+pennsylvania+avenue+washington+dc/"
// const contactLink = "mailto:example@daydream.hackclub.com"

// Sponsors Configuration
const sponsorsEnabled = true; // Set to false to hide the entire sponsors section
const sponsors = [
    { image: "/example/logo1.png", name: "Sponsor 1", url: "https://example1.com" },
    { image: "/example/logo2.png", name: "Sponsor 2", url: "https://example2.com" },
    { image: "/example/logo3.png", name: "Sponsor 3", url: "https://example3.com" },
    { image: "/example/logo4.png", name: "Sponsor 4", url: "https://example4.com" },
    { image: "/example/logo5.png", name: "Sponsor 5", url: "https://example5.com" },
    { image: "/example/logo6.png", name: "Sponsor 6", url: "https://example6.com" },
    { image: "/example/logo7.png", name: "Sponsor 7", url: "https://example7.com" }
];

// Schedule Configuration - You don't need to use this schedule, this is just an example!
const scheduleData = {
    saturday: {
        title: "Saturday, September 27th",
        items: [
            { event: "Doors open", time: "11:00 AM" },
            { event: "Opening ceremony", time: "12:00 PM" },
            { event: "Lunch", time: "12:30 PM" },
            { event: "Start working on your project!", time: "1:00 PM" },
            { event: "Workshop 1", time: "2:00 PM" },
            { event: "Activity 1", time: "4:00 PM" },
            { event: "Workshop 2", time: "4:00 PM" },
            { event: "Dinner", time: "6:00 PM" },
            { event: "Lightning talks", time: "8:00 PM" },
            { event: "Midnight surprise", time: "12:00 AM" }
        ]
    },
    sunday: {
        title: "Sunday, September 28th",
        items: [
            { event: "Breakfast", time: "8:00 AM" },
            { event: "Demos!", time: "10:30 AM" },
            { event: "Closing ceremony", time: "12:00 PM" }
        ]
    }
};
</script>
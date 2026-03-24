export function berekenUitstootGegevens(answers, uitstootData) {
    console.log(uitstootData)
    const categories = Object.entries(uitstootData);
    console.log("categories:", categories)

    let totaldaily = 0;
    let totalweekly = 0;
    let totalyearly = 0;
    
    let biggestcategory = {
        name: '',
        weekly: 0,
    };

    categories.forEach(([categoryName, values]) => {
        totaldaily += values.daily;
        totalweekly += values.weekly;
        totalyearly += values.yearly;
        
        if(values.weekly > biggestcategory.weekly){
            biggestcategory = {
                name: categoryName,
                weekly: values.weekly
            };
        };
    });

    const averageweekly = totalyearly /52;
    const averageyearly = totalyearly;

    console.log(totaldaily, totalweekly, totalyearly, averageweekly, averageyearly, biggestcategory);
    return {
        totaldaily,
        totalweekly,
        totalyearly,
        averageweekly,
        averageyearly,
        biggestcategory
    }
}







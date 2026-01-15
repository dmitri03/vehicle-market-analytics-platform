
export function extractSemanticFields(spanTexts) {
  const price = spanTexts.find(t => /^\$\d/.test(t));
  const mileage = spanTexts.find(t => /miles?/i.test(t));
  const location = spanTexts.find(t => /,\s?[A-Z]{2}$/.test(t));
  const title = spanTexts.find(t => /(19|20)\d{2}/.test(t));

  let city=null, state=null;
  if(location){
    const parts = location.split(",");
    city = parts[0].trim();
    state = parts[1].trim();
  }

  let year=null, model_config=null;
  if(title){
    const split = title.split(" ");
    year = parseInt(split[0]);
    model_config = split.slice(1).join(" ");
  }

  return { price, mileage, city, state, year, model_config, raw_title: title };
}

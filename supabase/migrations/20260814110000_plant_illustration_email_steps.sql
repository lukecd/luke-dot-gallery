update public.desk_email_templates
set
  subject_template = 'Your {plant_name} illustration is ready for Sow',
  text_template = E'Hi {first_name},\n\nThank you for suggesting {plant_name}. We made this illustration for you and attached it here.\n\nTo add it to Sow:\n1. Save the attached illustration to your Photos library.\n2. Open Sow and go to your {plant_name} plant.\n3. Tap the illustration area.\n4. Choose “Choose from Library.”\n5. Select the saved illustration and confirm.\n\nYou can always replace this illustration later with a photo from your own garden. A good plant story can hold both.\n\nWe have also approved this illustration for an upcoming Sow app build, where it will join the growing illustration library.\n\n— Sow'
where template_key = 'plant-illustration-ready-v1'
  and is_active = true;

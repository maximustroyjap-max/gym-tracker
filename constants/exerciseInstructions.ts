/**
 * EXERCISE INSTRUCTIONS DATABASE
 * Detailed step-by-step guides for default app exercises.
 * Custom exercises fall back to a generic message.
 */

import { Exercise } from './exercises';

export interface ExerciseInstructions {
  instructions: string[];
  tips?: string[];
}

const INSTRUCTIONS_DB: Record<string, ExerciseInstructions> = {
  // ─── Chest ───
  'bench-press-barbell': {
    instructions: [
      'Lie flat on a bench with your eyes directly under the bar.',
      'Grip the bar slightly wider than shoulder-width apart.',
      'Plant your feet firmly on the floor and arch your lower back slightly.',
      'Unrack the bar and hold it straight over your chest with arms extended.',
      'Lower the bar slowly to your mid-chest, keeping elbows tucked at about 75°.',
      'Pause briefly when the bar lightly touches your chest.',
      'Press the bar back up in a straight line until your arms are fully extended.',
    ],
    tips: ['Keep your shoulder blades pinched together throughout.', 'Do not bounce the bar off your chest.'],
  },
  'bench-press-dumbbell': {
    instructions: [
      'Sit on the edge of a flat bench holding a dumbbell in each hand.',
      'Lie back and bring the dumbbells to chest level with palms facing forward.',
      'Press the dumbbells up until your arms are fully extended above your chest.',
      'Lower the dumbbells slowly to the sides of your chest with control.',
      'Keep a slight bend in your elbows at the bottom to maintain tension.',
      'Press back up and slightly inward, squeezing your chest at the top.',
    ],
    tips: ['Do not let the dumbbells drift outward.', 'Maintain a neutral wrist position.'],
  },
  'incline-press-barbell': {
    instructions: [
      'Set the bench to a 30–45° incline angle.',
      'Lie back with your eyes under the bar and grip slightly wider than shoulder-width.',
      'Unrack the bar and hold it over your upper chest with arms extended.',
      'Lower the bar to your upper chest, controlling the descent.',
      'Pause briefly, then press the bar back up to the starting position.',
    ],
    tips: ['A steeper angle targets shoulders more; 30° is optimal for upper chest.'],
  },
  'incline-press-dumbbell': {
    instructions: [
      'Set the bench to a 30–45° incline and sit with dumbbells resting on your thighs.',
      'Lie back and position the dumbbells at chest height with palms facing forward.',
      'Press the dumbbells up and slightly inward over your upper chest.',
      'Lower with control to chest level, feeling a stretch in your upper pecs.',
      'Press back up, squeezing your chest at the top.',
    ],
    tips: ['Keep your core tight to prevent arching excessively.'],
  },
  'decline-press-barbell': {
    instructions: [
      'Secure your legs in the decline bench and lie back with eyes under the bar.',
      'Grip the bar slightly wider than shoulder-width.',
      'Unrack and lower the bar to your lower chest with control.',
      'Press the bar back up in a straight line to full arm extension.',
    ],
    tips: ['The decline angle reduces shoulder involvement and emphasizes lower chest.'],
  },
  'decline-press-dumbbell': {
    instructions: [
      'Set up on a decline bench with dumbbells at chest level.',
      'Press the dumbbells up over your lower chest.',
      'Lower slowly to the sides of your lower chest.',
      'Press back up, squeezing your pecs at the top.',
    ],
  },
  'chest-fly-dumbbell': {
    instructions: [
      'Lie on a flat bench holding dumbbells above your chest with palms facing each other.',
      'Maintain a slight bend in your elbows throughout the movement.',
      'Open your arms wide in an arc, lowering the dumbbells to chest level.',
      'Feel the stretch across your chest at the bottom.',
      'Bring the dumbbells back together over your chest in a controlled arc.',
    ],
    tips: ['Do not lower the dumbbells below chest level to protect your shoulders.'],
  },
  'chest-fly-cable': {
    instructions: [
      'Set the cable pulleys to chest height and stand in the center.',
      'Grab a handle in each hand and step forward into a staggered stance.',
      'Start with arms extended to the sides, slightly bent at the elbows.',
      'Bring your hands together in front of your chest in a hugging motion.',
      'Squeeze your chest at the peak contraction, then slowly return to the start.',
    ],
  },
  'chest-fly-machine': {
    instructions: [
      'Sit in the machine with your back flat against the pad.',
      'Grip the handles with elbows slightly bent.',
      'Bring the handles together in front of your chest.',
      'Squeeze your pecs, then slowly return to the starting position.',
    ],
  },
  'dip-chest': {
    instructions: [
      'Grip parallel bars and lift yourself to full arm extension.',
      'Lean your torso forward about 30° to emphasize the chest.',
      'Bend your elbows and lower your body until your upper arms are parallel to the floor.',
      'Press back up to the starting position by extending your arms.',
    ],
    tips: ['The more you lean forward, the more chest engagement.'],
  },
  'push-up': {
    instructions: [
      'Start in a plank position with hands slightly wider than shoulder-width.',
      'Keep your body in a straight line from head to heels.',
      'Lower your chest to the floor by bending your elbows.',
      'Pause briefly when your chest is just above the floor.',
      'Push back up to the starting position, fully extending your arms.',
    ],
    tips: ['Keep your core tight and do not let your hips sag.'],
  },
  'push-up-decline': {
    instructions: [
      'Place your feet on an elevated surface like a bench or step.',
      'Assume a push-up position with hands on the floor.',
      'Lower your chest to the floor with control.',
      'Push back up to full arm extension.',
    ],
    tips: ['The higher the elevation, the more upper chest and shoulder emphasis.'],
  },
  'push-up-incline': {
    instructions: [
      'Place your hands on an elevated surface like a bench or step.',
      'Assume a push-up position with feet on the floor.',
      'Lower your chest to the bench with control.',
      'Push back up to full arm extension.',
    ],
    tips: ['This variation is easier and emphasizes the lower chest.'],
  },
  'cable-crossover': {
    instructions: [
      'Set the pulleys above head height and grab the handles.',
      'Step forward and lean slightly forward from the hips.',
      'With arms extended and slightly bent, pull the handles down and across your body.',
      'Squeeze your chest, then slowly return to the starting position.',
    ],
  },
  'svend-press': {
    instructions: [
      'Hold a small weight plate or pair of dumbbells pressed together at chest height.',
      'Extend your arms forward while squeezing the weights together.',
      'Feel the contraction in your chest, then return to the start.',
    ],
  },

  // ─── Back ───
  'deadlift-conventional': {
    instructions: [
      'Stand with feet hip-width apart, toes under the bar.',
      'Bend at the hips and knees to grip the bar just outside your legs.',
      'Keep your back straight, chest up, and shoulders slightly in front of the bar.',
      'Brace your core and drive through your heels to lift the bar.',
      'Keep the bar close to your body as you stand up straight.',
      'Lock out at the top by extending hips and knees fully.',
      'Lower the bar back down with control, hinging at the hips first.',
    ],
    tips: ['Do not round your back at any point.', 'The bar should travel in a straight vertical line.'],
  },
  'deadlift-romanian': {
    instructions: [
      'Stand holding a barbell with an overhand grip at hip level.',
      'Slightly bend your knees and keep them fixed in this position.',
      'Hinge at the hips, pushing your butt back as you lower the bar.',
      'Lower the bar just below your knees while keeping it close to your legs.',
      'Feel the stretch in your hamstrings, then drive your hips forward to stand up.',
    ],
    tips: ['This is a hip-hinge movement, not a squat.', 'Keep your back neutral throughout.'],
  },
  'deadlift-sumo': {
    instructions: [
      'Take a wide stance with toes pointing outward at about 45°.',
      'Grip the bar inside your legs with arms straight.',
      'Keep your chest up and back flat.',
      'Drive through your heels and extend hips and knees to stand.',
      'Lower the bar back down with control.',
    ],
    tips: ['Sumo deadlifts reduce lower back stress and increase quad engagement.'],
  },
  'pull-up': {
    instructions: [
      'Hang from a pull-up bar with palms facing away, slightly wider than shoulder-width.',
      'Start from a dead hang with arms fully extended.',
      'Pull your body up by driving your elbows down toward your hips.',
      'Continue until your chin clears the bar.',
      'Lower yourself back down with control to full arm extension.',
    ],
    tips: ['Initiate the pull by engaging your lats, not just your arms.'],
  },
  'chin-up': {
    instructions: [
      'Hang from a bar with palms facing toward you, about shoulder-width apart.',
      'Start from a dead hang with arms fully extended.',
      'Pull yourself up, focusing on squeezing your shoulder blades together.',
      'Continue until your chin is above the bar.',
      'Lower yourself back down with control.',
    ],
    tips: ['Chin-ups emphasize the biceps more than pull-ups.'],
  },
  'lat-pulldown-wide': {
    instructions: [
      'Sit at the lat pulldown machine and secure your thighs under the pads.',
      'Grip the bar wider than shoulder-width with palms facing away.',
      'Lean back slightly and pull the bar down to your upper chest.',
      'Squeeze your shoulder blades together at the bottom.',
      'Slowly return the bar to the starting position with control.',
    ],
    tips: ['Do not use momentum or lean back excessively.'],
  },
  'lat-pulldown-close': {
    instructions: [
      'Sit at the machine and grip the close-grip handle with palms facing each other.',
      'Pull the handle down to your upper chest, squeezing your lats.',
      'Slowly return to the starting position.',
    ],
  },
  'row-barbell-bent-over': {
    instructions: [
      'Stand with feet shoulder-width apart, holding a barbell with an overhand grip.',
      'Bend at the hips until your torso is at about 45° to the floor.',
      'Keep your back straight and core braced.',
      'Pull the bar toward your lower chest, driving elbows back.',
      'Squeeze your shoulder blades together at the top.',
      'Lower the bar back down with control.',
    ],
  },
  'row-cable-seated': {
    instructions: [
      'Sit at the cable row machine with feet on the foot plates and knees slightly bent.',
      'Grab the handle with both hands and sit upright with a neutral spine.',
      'Pull the handle toward your midsection, driving elbows straight back.',
      'Squeeze your shoulder blades together at the contraction.',
      'Slowly extend your arms back to the starting position.',
    ],
  },
  'row-dumbbell-single': {
    instructions: [
      'Place one knee and hand on a bench for support.',
      'Hold a dumbbell in the other hand with arm fully extended.',
      'Keep your back flat and core tight.',
      'Pull the dumbbell up toward your hip, keeping elbow close to your body.',
      'Squeeze your lat at the top, then lower with control.',
    ],
  },
  'row-t-bar': {
    instructions: [
      'Straddle the T-bar machine and grip the handles.',
      'Keep your back flat and chest up.',
      'Pull the weight toward your chest, driving elbows back.',
      'Squeeze your back muscles, then lower with control.',
    ],
  },
  'yates-row': {
    instructions: [
      'Stand holding a barbell with an underhand grip.',
      'Bend at the hips so your torso is at about 70°.',
      'Pull the bar to your lower abdomen, keeping elbows tucked.',
      'Squeeze your lats and lower back, then lower with control.',
    ],
  },
  'seal-row': {
    instructions: [
      'Lie face down on a seal row bench with arms hanging straight down.',
      'Grip the barbell with palms facing down.',
      'Pull the bar toward the bench, squeezing your shoulder blades.',
      'Lower with control back to the starting position.',
    ],
  },
  'hyperextension': {
    instructions: [
      'Position yourself on a hyperextension bench with hips on the pad and ankles secured.',
      'Cross your arms over your chest or hold a weight plate.',
      'Lower your torso toward the floor by hinging at the hips.',
      'Feel the stretch in your hamstrings, then lift your torso back up.',
      'Squeeze your glutes and lower back at the top.',
    ],
  },
  'reverse-hyperextension': {
    instructions: [
      'Lie face down on a reverse hyper bench with hips at the edge.',
      'Hold the handles and let your legs hang straight down.',
      'Lift your legs up and back by contracting your glutes and lower back.',
      'Lower with control back to the starting position.',
    ],
  },
  'good-morning': {
    instructions: [
      'Place a barbell on your upper back as if preparing to squat.',
      'Stand with feet shoulder-width apart and a slight bend in your knees.',
      'Hinge at the hips, pushing your butt back while keeping your back straight.',
      'Lower your torso until it is nearly parallel to the floor.',
      'Drive your hips forward to return to the starting position.',
    ],
  },
  'inverted-row': {
    instructions: [
      'Set a bar at waist height and lie underneath it.',
      'Grip the bar with hands slightly wider than shoulder-width.',
      'Keep your body in a straight line from head to heels.',
      'Pull your chest up to the bar, squeezing your shoulder blades.',
      'Lower yourself back down with control.',
    ],
  },
  'pullover-dumbbell': {
    instructions: [
      'Lie across a flat bench with only your upper back supported.',
      'Hold a dumbbell with both hands extended over your chest.',
      'Lower the dumbbell behind your head in an arc, feeling a chest stretch.',
      'Pull the dumbbell back over your chest to the starting position.',
    ],
  },
  'meadows-row': {
    instructions: [
      'Stand beside a T-bar landmine with feet staggered.',
      'Bend at the hips and grip the end of the bar with one hand.',
      'Pull the bar up and back, driving your elbow up.',
      'Squeeze your lat, then lower with control.',
    ],
  },
  'landmine-row': {
    instructions: [
      'Stand facing a landmine bar in a T-bar setup.',
      'Bend at the hips and grip the bar with both hands.',
      'Pull the bar toward your chest, squeezing your back.',
      'Lower with control.',
    ],
  },

  // ─── Legs ───
  'squat-back': {
    instructions: [
      'Stand with feet shoulder-width apart, toes pointed slightly outward.',
      'Place a barbell on your upper back/shoulders.',
      'Brace your core and keep your chest up.',
      'Bend at the hips and knees simultaneously, lowering your body.',
      'Descend until your thighs are at least parallel to the floor.',
      'Drive through your heels to stand back up, extending hips and knees.',
    ],
    tips: ['Keep your knees tracking over your toes.', 'Do not let your heels lift off the floor.'],
  },
  'squat-front': {
    instructions: [
      'Rest the barbell on the front of your shoulders with elbows high.',
      'Stand with feet shoulder-width apart.',
      'Brace your core and keep your torso upright.',
      'Descend by bending at the knees and hips, keeping elbows up.',
      'Squat down until your thighs are parallel to the floor.',
      'Drive through your heels to stand back up.',
    ],
    tips: ['Front squats emphasize the quads and require more core stability.'],
  },
  'hack-squat': {
    instructions: [
      'Position yourself on the hack squat machine with shoulders under the pads.',
      'Place your feet on the platform shoulder-width apart.',
      'Release the safety handles and lower the weight by bending your knees.',
      'Descend until your thighs are parallel to the platform.',
      'Drive through your heels to extend your legs and return to the start.',
    ],
  },
  'leg-press': {
    instructions: [
      'Sit in the leg press machine and place your feet on the platform shoulder-width apart.',
      'Release the safety handles and lower the platform by bending your knees.',
      'Bring your knees toward your chest until they are at about 90°.',
      'Press the platform away by extending your legs, but do not lock your knees.',
      'Return to the starting position with control.',
    ],
    tips: ['Do not let your lower back round off the pad.'],
  },
  'leg-extension': {
    instructions: [
      'Sit in the leg extension machine with your back against the pad.',
      'Hook your ankles under the padded bar.',
      'Extend your legs fully, squeezing your quads at the top.',
      'Lower the weight back down with control.',
    ],
  },
  'hamstring-curl-lying': {
    instructions: [
      'Lie face down on the leg curl machine with ankles under the pad.',
      'Curl your heels toward your glutes by contracting your hamstrings.',
      'Squeeze at the top, then lower with control.',
    ],
  },
  'hamstring-curl-seated': {
    instructions: [
      'Sit in the machine with your back against the pad and legs extended.',
      'Hook your ankles under the padded lever.',
      'Curl your legs back, squeezing your hamstrings.',
      'Lower with control to the starting position.',
    ],
  },
  'hip-thrust': {
    instructions: [
      'Sit on the floor with your upper back against a bench.',
      'Roll a barbell over your hips and bend your knees with feet flat.',
      'Drive through your heels and thrust your hips upward.',
      'Squeeze your glutes hard at the top, with your body forming a straight line.',
      'Lower your hips back down with control.',
    ],
    tips: ['Do not hyperextend your lower back at the top.'],
  },
  'glute-bridge': {
    instructions: [
      'Lie on your back with knees bent and feet flat on the floor.',
      'Place a barbell or weight across your hips if desired.',
      'Drive through your heels and lift your hips off the floor.',
      'Squeeze your glutes at the top, forming a straight line from shoulders to knees.',
      'Lower your hips back down with control.',
    ],
  },
  'bulgarian-split-squat': {
    instructions: [
      'Stand a few feet in front of a bench and place one foot behind you on the bench.',
      'Hold dumbbells at your sides or a barbell on your back.',
      'Lower your back knee toward the floor, keeping your torso upright.',
      'Drive through your front heel to return to the starting position.',
    ],
    tips: ['Keep your front knee tracking over your toes.', 'This exercise demands significant balance and stability.'],
  },
  'lunge-walking': {
    instructions: [
      'Stand holding dumbbells at your sides.',
      'Step forward with one leg, lowering your hips until both knees are at 90°.',
      'Push off your front foot and bring your back foot forward into the next step.',
      'Continue walking forward, alternating legs.',
    ],
  },
  'lunge-reverse': {
    instructions: [
      'Stand with feet together, holding dumbbells if desired.',
      'Step backward with one leg, lowering your hips until both knees are at 90°.',
      'Drive through your front heel to return to the starting position.',
    ],
  },
  'lunge-static': {
    instructions: [
      'Stand in a split stance with one foot forward and one back.',
      'Lower your back knee toward the floor until both knees are at 90°.',
      'Drive through your front heel to return to the starting position.',
    ],
  },
  'step-up': {
    instructions: [
      'Stand facing a bench or box, holding dumbbells at your sides.',
      'Step up onto the bench with one foot, driving through your heel.',
      'Bring your other foot up to stand on the bench.',
      'Step back down with the same leg, then repeat.',
    ],
  },
  'goblet-squat': {
    instructions: [
      'Hold a dumbbell vertically at chest height with both hands under the top weight.',
      'Stand with feet slightly wider than shoulder-width, toes pointing slightly out.',
      'Squat down by bending at the hips and knees, keeping your chest up.',
      'Descend until your elbows touch the inside of your thighs.',
      'Drive through your heels to stand back up.',
    ],
  },
  'calf-raise-standing': {
    instructions: [
      'Stand on a raised platform with the balls of your feet on the edge.',
      'Lower your heels below the platform to stretch your calves.',
      'Rise up onto your toes as high as possible, squeezing your calves.',
      'Lower back down with control.',
    ],
  },
  'calf-raise-seated': {
    instructions: [
      'Sit in the seated calf raise machine with thighs under the pads.',
      'Place the balls of your feet on the platform.',
      'Lower your heels to stretch your calves.',
      'Rise up onto your toes, squeezing your calves at the top.',
      'Lower with control.',
    ],
  },
  'donkey-calf-raise': {
    instructions: [
      'Bend at the hips and rest your forearms on a padded support.',
      'Place the balls of your feet on a raised platform.',
      'Lower your heels to stretch, then rise up onto your toes.',
      'Squeeze your calves at the top.',
    ],
  },
  'tibialis-raise': {
    instructions: [
      'Sit on a bench with heels on the floor and feet flexed upward.',
      'Place a dumbbell or weight across the top of your feet.',
      'Pull your toes upward toward your shins, contracting your tibialis.',
      'Lower back down with control.',
    ],
  },
  'sissy-squat': {
    instructions: [
      'Stand with feet close together, holding onto a support for balance.',
      'Rise onto the balls of your feet.',
      'Lean your torso back as you bend your knees, lowering your body.',
      'Go down as far as you can while keeping your heels off the floor.',
      'Push back up by extending your knees.',
    ],
  },
  'nordic-curl': {
    instructions: [
      'Kneel on a pad and secure your ankles under a support.',
      'Keep your body straight from knees to shoulders.',
      'Lower your torso forward by extending your knees, using hamstrings to control the descent.',
      'Catch yourself with your hands when you can no longer control the descent.',
      'Push back up to the starting position.',
    ],
    tips: ['This is an advanced exercise. Start with a limited range of motion.'],
  },
  'wall-sit': {
    instructions: [
      'Stand with your back against a wall and feet shoulder-width apart.',
      'Slide down until your thighs are parallel to the floor.',
      'Hold this position for the prescribed duration.',
      'Keep your back flat against the wall throughout.',
    ],
  },
  'belt-squat': {
    instructions: [
      'Attach a weight belt around your hips connected to a low pulley or belt squat machine.',
      'Stand upright with feet shoulder-width apart.',
      'Squat down by bending at the hips and knees.',
      'Drive through your heels to return to standing.',
    ],
  },
  'pendulum-squat': {
    instructions: [
      'Position yourself on the pendulum squat machine.',
      'Place your feet on the platform and release the safety.',
      'Lower the weight by bending your knees and hips.',
      'Drive through your heels to extend your legs.',
    ],
  },
  'v-squat': {
    instructions: [
      'Stand in the V-squat machine with shoulders under the pads.',
      'Place feet on the platform at shoulder width.',
      'Lower by bending knees and hips, then drive back up.',
    ],
  },
  'horizontal-leg-press': {
    instructions: [
      'Sit in the horizontal leg press with back flat against the pad.',
      'Place feet on the platform and release the safety.',
      'Lower the weight by bending your knees toward your chest.',
      'Press the platform away, extending your legs without locking knees.',
    ],
  },

  // ─── Shoulders ───
  'overhead-press-barbell': {
    instructions: [
      'Stand with feet shoulder-width apart, holding a barbell at shoulder height.',
      'Grip the bar just outside shoulder-width with palms facing forward.',
      'Brace your core and squeeze your glutes.',
      'Press the bar straight up until your arms are fully extended.',
      'Lower the bar back to shoulder height with control.',
    ],
    tips: ['Do not arch your lower back excessively.', 'Keep the bar path as straight as possible.'],
  },
  'overhead-press-dumbbell': {
    instructions: [
      'Stand holding dumbbells at shoulder height with palms facing forward.',
      'Brace your core and press the dumbbells overhead.',
      'At the top, bring the dumbbells slightly together without clinking them.',
      'Lower with control back to shoulder height.',
    ],
  },
  'overhead-press-push': {
    instructions: [
      'Start with a barbell at shoulder height, using a slightly wider grip.',
      'Dip your knees slightly and then explosively drive the bar overhead.',
      'Use leg drive to help press the weight up.',
      'Lock out your arms at the top, then lower with control.',
    ],
  },
  'lateral-raise-dumbbell': {
    instructions: [
      'Stand holding dumbbells at your sides with palms facing your body.',
      'With a slight bend in your elbows, raise your arms out to the sides.',
      'Lift until your arms are parallel to the floor.',
      'Pause briefly at the top, then lower with control.',
    ],
    tips: ['Do not swing the weights or use momentum.'],
  },
  'lateral-raise-cable': {
    instructions: [
      'Stand beside a low cable pulley and grab the handle with the outside hand.',
      'Raise your arm out to the side until parallel to the floor.',
      'Lower with control.',
    ],
  },
  'lateral-raise-machine': {
    instructions: [
      'Sit in the lateral raise machine with arms against the pads.',
      'Raise your arms out to the sides until parallel to the floor.',
      'Lower with control.',
    ],
  },
  'face-pull': {
    instructions: [
      'Set a cable pulley at face height with a rope attachment.',
      'Grab the rope with both hands and step back into a staggered stance.',
      'Pull the rope toward your face, separating the ends as you pull.',
      'Focus on squeezing your rear delts and upper back.',
      'Slowly return to the starting position.',
    ],
  },
  'banded-face-pull': {
    instructions: [
      'Anchor a resistance band at face height.',
      'Grab the band with both hands and step back to create tension.',
      'Pull the band toward your face, separating your hands as you pull.',
      'Squeeze your rear delts, then return with control.',
    ],
  },
  'rear-delt-fly-dumbbell': {
    instructions: [
      'Bend at the hips holding dumbbells with palms facing each other.',
      'With a slight bend in your elbows, raise your arms out to the sides.',
      'Squeeze your rear delts at the top, then lower with control.',
    ],
  },
  'shrug-barbell': {
    instructions: [
      'Stand holding a barbell in front of your thighs with an overhand grip.',
      'Shrug your shoulders straight up toward your ears.',
      'Hold the contraction briefly, then lower with control.',
    ],
  },
  'shrug-dumbbell': {
    instructions: [
      'Stand holding dumbbells at your sides.',
      'Shrug your shoulders straight up toward your ears.',
      'Squeeze your traps at the top, then lower with control.',
    ],
  },
  'arnold-press-dumbbell': {
    instructions: [
      'Sit holding dumbbells at chest height with palms facing you.',
      'As you press overhead, rotate your palms to face forward.',
      'At the top, your arms should be fully extended with palms facing away.',
      'Reverse the motion as you lower back down.',
    ],
  },
  'landmine-press': {
    instructions: [
      'Stand facing a landmine bar, holding the end with both hands at chest height.',
      'Press the bar up and away from your body at about a 45° angle.',
      'Extend your arms fully, then lower with control.',
    ],
  },
  'upright-row-barbell': {
    instructions: [
      'Stand holding a barbell in front of your thighs with a close grip.',
      'Pull the bar straight up toward your chin, keeping it close to your body.',
      'Your elbows should flare out to the sides and go higher than your hands.',
      'Lower with control.',
    ],
    tips: ['Use a lighter weight to protect your shoulders.'],
  },
  'z-press': {
    instructions: [
      'Sit on the floor with legs extended straight out in front of you.',
      'Hold a barbell or dumbbells at shoulder height.',
      'Press the weight overhead without using any leg drive.',
      'Lower with control, keeping your core engaged.',
    ],
    tips: ['This exercise demands extreme core stability.'],
  },
  'scarecrow': {
    instructions: [
      'Stand holding dumbbells with arms bent at 90° and elbows at shoulder height.',
      'Rotate your forearms down until they are parallel to the floor.',
      'Rotate back up to the starting position.',
    ],
  },
  'w-raise-dumbbell': {
    instructions: [
      'Bend at the hips holding dumbbells with elbows bent at 90°.',
      'Raise your arms out to the sides, forming a W shape.',
      'Squeeze your rear delts and rotator cuffs, then lower.',
    ],
  },
  'y-raise-dumbbell': {
    instructions: [
      'Lie face down on an incline bench holding dumbbells.',
      'Raise your arms forward and outward at about a 45° angle, forming a Y shape.',
      'Squeeze your upper back, then lower with control.',
    ],
  },
  'reverse-pec-deck': {
    instructions: [
      'Sit facing the pec deck machine and grab the handles.',
      'Pull the handles back, squeezing your rear delts.',
      'Slowly return to the starting position.',
    ],
  },
  'meadows-shrug': {
    instructions: [
      'Hold dumbbells at your sides with palms facing behind you.',
      'Shrug your shoulders up and slightly back.',
      'Squeeze your traps, then lower with control.',
    ],
  },

  // ─── Arms ───
  'bicep-curl-dumbbell': {
    instructions: [
      'Stand holding dumbbells at your sides with palms facing forward.',
      'Curl the dumbbells up toward your shoulders, keeping elbows at your sides.',
      'Squeeze your biceps at the top, then lower with control.',
    ],
    tips: ['Do not swing your body or use momentum.'],
  },
  'bicep-curl-barbell': {
    instructions: [
      'Stand holding a barbell with an underhand grip, hands shoulder-width apart.',
      'Curl the bar up toward your chest, keeping elbows tucked at your sides.',
      'Squeeze your biceps at the top, then lower with control.',
    ],
  },
  'bicep-curl-hammer': {
    instructions: [
      'Stand holding dumbbells at your sides with palms facing each other.',
      'Curl the dumbbells up toward your shoulders, keeping palms neutral.',
      'This targets the brachialis and brachioradialis in addition to the biceps.',
      'Lower with control.',
    ],
  },
  'bicep-curl-preacher': {
    instructions: [
      'Sit at a preacher curl bench and rest your upper arms on the pad.',
      'Grip the EZ bar or barbell with an underhand grip.',
      'Curl the weight up, squeezing your biceps at the top.',
      'Lower with control until your arms are nearly fully extended.',
    ],
  },
  'concentration-curl': {
    instructions: [
      'Sit on a bench and lean forward, resting your elbow on the inside of your thigh.',
      'Hold a dumbbell with your arm fully extended.',
      'Curl the dumbbell up toward your shoulder, keeping your upper arm still.',
      'Squeeze at the top, then lower with control.',
    ],
  },
  'incline-curl-dumbbell': {
    instructions: [
      'Sit on an incline bench set to about 45°.',
      'Hold dumbbells with arms fully extended and palms facing forward.',
      'Curl the dumbbells up, keeping your elbows back.',
      'Squeeze your biceps at the top, then lower with control.',
    ],
    tips: ['The incline position stretches the biceps more at the bottom.'],
  },
  'spider-curl': {
    instructions: [
      'Lie face down on an incline bench set to about 60°.',
      'Hold dumbbells with arms hanging straight down.',
      'Curl the dumbbells up, squeezing your biceps at the top.',
      'Lower with control.',
    ],
  },
  'drag-curl': {
    instructions: [
      'Stand holding a barbell with an underhand grip.',
      'Pull your elbows back and curl the bar up along the front of your body.',
      'The bar stays close to your torso throughout the movement.',
      'Squeeze at the top, then lower with control.',
    ],
  },
  'cross-body-curl': {
    instructions: [
      'Stand holding dumbbells at your sides.',
      'Curl one dumbbell up and across your body toward the opposite shoulder.',
      'Lower with control and alternate sides.',
    ],
  },
  'cable-curl': {
    instructions: [
      'Stand facing a low cable pulley with a straight bar attachment.',
      'Grip the bar with palms facing up and elbows at your sides.',
      'Curl the bar up toward your chest, squeezing your biceps.',
      'Lower with control.',
    ],
  },
  'skullcrusher': {
    instructions: [
      'Lie on a flat bench holding an EZ bar or dumbbells with arms extended over your chest.',
      'Bend at the elbows and lower the weight toward your forehead.',
      'Keep your upper arms stationary and perpendicular to the floor.',
      'Extend your arms back to the starting position.',
    ],
    tips: ['Do not let your elbows flare out.', 'Use a controlled tempo to protect your elbows.'],
  },
  'tricep-extension-cable': {
    instructions: [
      'Stand facing a high cable pulley with a straight bar or rope attachment.',
      'Grip the bar with palms facing down and elbows tucked at your sides.',
      'Push the bar down by extending your arms fully.',
      'Squeeze your triceps at the bottom, then return with control.',
    ],
  },
  'tricep-extension-dumbbell': {
    instructions: [
      'Lie on a flat bench holding dumbbells with arms extended over your chest.',
      'Bend at the elbows and lower the dumbbells to the sides of your head.',
      'Keep your upper arms stationary.',
      'Extend your arms back to the starting position.',
    ],
  },
  'tricep-extension-overhead': {
    instructions: [
      'Stand or sit holding one dumbbell with both hands overhead.',
      'Lower the dumbbell behind your head by bending at the elbows.',
      'Keep your upper arms close to your ears.',
      'Extend your arms to lift the dumbbell back overhead.',
    ],
  },
  'dip-tricep': {
    instructions: [
      'Grip parallel bars and lift yourself to full arm extension.',
      'Keep your torso upright to emphasize the triceps.',
      'Bend your elbows and lower your body until your upper arms are parallel to the floor.',
      'Press back up to full extension.',
    ],
  },
  'jm-press': {
    instructions: [
      'Lie on a bench holding a barbell with a close grip, arms extended over your chest.',
      'Lower the bar toward your upper chest/lower neck by bending at the elbows.',
      'Your elbows should tuck inward, not flare out.',
      'Press back up to the starting position.',
    ],
  },
  'close-grip-dumbbell-press': {
    instructions: [
      'Lie on a flat bench holding dumbbells with palms facing each other.',
      'Keep the dumbbells close together over your chest.',
      'Lower them to your chest, then press back up.',
      'This variation emphasizes the triceps more than the chest.',
    ],
  },

  // ─── Core ───
  'plank': {
    instructions: [
      'Start in a push-up position but rest on your forearms instead of your hands.',
      'Keep your body in a straight line from head to heels.',
      'Engage your core and hold the position for the prescribed time.',
      'Do not let your hips sag or pike up.',
    ],
    tips: ['Breathe normally throughout the hold.'],
  },
  'plank-side': {
    instructions: [
      'Lie on your side and prop yourself up on one forearm.',
      'Stack your feet on top of each other and lift your hips off the floor.',
      'Keep your body in a straight line from head to feet.',
      'Hold for the prescribed time, then switch sides.',
    ],
  },
  'crunch': {
    instructions: [
      'Lie on your back with knees bent and feet flat on the floor.',
      'Place your hands behind your head or across your chest.',
      'Lift your shoulder blades off the floor by contracting your abs.',
      'Do not pull on your neck.',
      'Lower back down with control.',
    ],
  },
  'hanging-leg-raise': {
    instructions: [
      'Hang from a pull-up bar with arms fully extended.',
      'Keep your legs straight and lift them up toward the bar.',
      'Lift as high as you can, aiming to bring your toes to bar height.',
      'Lower with control without swinging.',
    ],
  },
  'lying-leg-raise': {
    instructions: [
      'Lie on your back with legs extended and hands at your sides or under your hips.',
      'Lift your legs up until they are perpendicular to the floor.',
      'Lower them back down with control without letting your lower back arch.',
    ],
  },
  'russian-twist': {
    instructions: [
      'Sit on the floor with knees bent and feet elevated slightly.',
      'Lean back to about a 45° angle and hold a weight with both hands.',
      'Rotate your torso from side to side, touching the weight to the floor beside your hips.',
    ],
  },
  'ab-wheel-kneeling': {
    instructions: [
      'Kneel on the floor and hold the ab wheel with both hands.',
      'Place the wheel on the floor in front of your knees.',
      'Roll the wheel forward, extending your body as far as you can control.',
      'Keep your core tight and do not let your lower back sag.',
      'Use your abs to pull yourself back to the starting position.',
    ],
  },
  'ab-wheel-standing': {
    instructions: [
      'Stand holding the ab wheel at your feet.',
      'Roll the wheel forward, lowering your body toward the floor.',
      'Go as far as you can control, then pull back using your abs.',
    ],
    tips: ['This is an extremely advanced variation of the ab wheel rollout.'],
  },
  'dead-bug': {
    instructions: [
      'Lie on your back with arms extended toward the ceiling and knees bent at 90°.',
      'Lower one arm behind your head while extending the opposite leg.',
      'Keep your lower back pressed firmly into the floor.',
      'Return to the starting position and alternate sides.',
    ],
  },
  'bird-dog': {
    instructions: [
      'Start on all fours with hands under shoulders and knees under hips.',
      'Extend one arm forward and the opposite leg back.',
      'Keep your core engaged and your back flat.',
      'Return to the starting position and alternate sides.',
    ],
  },
  'bicycle-crunch': {
    instructions: [
      'Lie on your back with hands behind your head and legs elevated.',
      'Bring one knee toward your chest while rotating your upper body to bring the opposite elbow toward that knee.',
      'Alternate sides in a pedaling motion.',
    ],
  },
  'sit-up': {
    instructions: [
      'Lie on your back with knees bent and feet anchored.',
      'Cross your arms over your chest or place hands behind your head.',
      'Sit up by contracting your abs until your torso is upright.',
      'Lower back down with control.',
    ],
  },
  'toes-to-bar': {
    instructions: [
      'Hang from a pull-up bar with an overhand grip.',
      'Keeping legs straight, lift your feet up to touch the bar.',
      'Use your core to control the movement and avoid excessive swinging.',
      'Lower with control.',
    ],
  },
  'woodchop-cable': {
    instructions: [
      'Set a cable pulley at the highest setting and grab the handle with both hands.',
      'Stand with feet shoulder-width apart and pull the cable down and across your body.',
      'Rotate your torso as you pull, keeping your arms extended.',
      'Slowly return to the starting position.',
    ],
  },
  'pallof-press': {
    instructions: [
      'Stand perpendicular to a cable machine set at chest height.',
      'Grab the handle with both hands and step away to create tension.',
      'Press the handle straight out in front of your chest.',
      'Resist the rotational force, keeping your torso facing forward.',
      'Bring the handle back to your chest and repeat.',
    ],
  },
  'copenhagen-plank': {
    instructions: [
      'Lie on your side and prop yourself up on one forearm.',
      'Place your top foot on a bench with the bottom foot underneath.',
      'Lift your hips off the floor, keeping your body straight.',
      'Hold for the prescribed time, then switch sides.',
    ],
  },

  // ─── Full Body / Olympic ───
  'clean-and-jerk': {
    instructions: [
      'Stand with feet hip-width apart, gripping the bar just outside your legs.',
      'Lift the bar from the floor to your shoulders in one explosive motion (the clean).',
      'Dip slightly and drive the bar overhead with leg drive (the jerk).',
      'Lock out your arms and stand straight.',
      'Lower the bar back to the floor with control.',
    ],
    tips: ['This is a complex Olympic lift. Master each part separately first.'],
  },
  'snatch': {
    instructions: [
      'Stand with feet hip-width apart, gripping the bar very wide.',
      'Lift the bar from the floor to overhead in one explosive motion.',
      'Drop under the bar into a squat to catch it overhead.',
      'Stand up from the squat with the bar locked out.',
      'Lower the bar back to the floor.',
    ],
    tips: ['The snatch is the most technical Olympic lift. Consider coaching.'],
  },
  'power-clean': {
    instructions: [
      'Stand with feet hip-width apart, gripping the bar just outside your legs.',
      'Lift the bar from the floor to your shoulders in one explosive motion.',
      'Catch the bar in a partial squat, then stand up.',
      'Lower the bar back to the floor.',
    ],
  },
  'kettlebell-swing': {
    instructions: [
      'Stand with feet slightly wider than shoulder-width, holding a kettlebell with both hands.',
      'Hinge at the hips and swing the kettlebell back between your legs.',
      'Explosively drive your hips forward to swing the kettlebell up to chest height.',
      'Let the kettlebell fall back down and repeat the motion.',
    ],
    tips: ['The power comes from your hips, not your arms.'],
  },
  'turkish-get-up': {
    instructions: [
      'Lie on your back holding a kettlebell or dumbbell straight up with one arm.',
      'Bend the knee on the same side and roll onto your opposite elbow.',
      'Push up onto your hand, then lift your hips off the floor.',
      'Sweep your straight leg underneath you into a lunge position.',
      'Stand up from the lunge while keeping the weight overhead.',
      'Reverse all steps to return to the starting position.',
    ],
    tips: ['This is a complex movement. Start with no weight to learn the pattern.'],
  },
  'thruster': {
    instructions: [
      'Hold a barbell or dumbbells at shoulder height with feet shoulder-width apart.',
      'Squat down until your thighs are parallel to the floor.',
      'Explosively stand up and press the weight overhead in one motion.',
      'Lower the weight back to shoulder height and repeat.',
    ],
  },
  'farmers-walk': {
    instructions: [
      'Hold a heavy dumbbell or kettlebell in each hand.',
      'Stand tall with shoulders back and core engaged.',
      'Walk forward for the prescribed distance or time.',
      'Maintain an upright posture throughout.',
    ],
  },
  'muscle-up': {
    instructions: [
      'Hang from a pull-up bar with a false grip (wrists over the bar).',
      'Pull your chest up to the bar explosively.',
      'Transition your chest over the bar by leaning forward.',
      'Press out to full arm extension above the bar.',
      'Lower back down with control.',
    ],
    tips: ['This is an advanced calisthenics skill requiring significant pulling strength.'],
  },
  'sled-push': {
    instructions: [
      'Load a sled with an appropriate weight.',
      'Lean into the sled with arms extended and drive through your legs.',
      'Push the sled forward for the prescribed distance.',
      'Keep your core tight and your back straight.',
    ],
  },
  'sled-pull': {
    instructions: [
      'Attach a harness or rope to a loaded sled.',
      'Lean back and pull the sled toward you by driving through your heels.',
      'Keep your core engaged and your back straight.',
    ],
  },

  // ─── Cardio ───
  'running-treadmill': {
    instructions: [
      'Step onto the treadmill and start at a slow walking pace to warm up.',
      'Gradually increase the speed to your target pace.',
      'Maintain an upright posture with a slight forward lean.',
      'Land on your midfoot and push off with your toes.',
      'Swing your arms naturally at your sides.',
    ],
  },
  'cycling-stationary': {
    instructions: [
      'Adjust the seat height so your leg is almost fully extended at the bottom of the pedal stroke.',
      'Start pedaling at a low resistance to warm up.',
      'Maintain a cadence of 60–90 RPM for steady-state cardio.',
      'Keep your core engaged and your upper body relaxed.',
    ],
  },
  'rowing-machine': {
    instructions: [
      'Sit on the rowing machine and secure your feet in the straps.',
      'Grab the handle with an overhand grip.',
      'Drive through your legs first, then lean back slightly, then pull the handle to your lower ribs.',
      'Reverse the sequence: extend arms, lean forward, bend knees.',
    ],
    tips: ['The power should come 60% from legs, 20% from core, 20% from arms.'],
  },
  'jump-rope': {
    instructions: [
      'Hold the rope handles with elbows close to your sides.',
      'Swing the rope over your head using your wrists, not your arms.',
      'Jump just high enough to clear the rope, landing softly on the balls of your feet.',
      'Maintain a steady rhythm.',
    ],
  },
  'battle-ropes': {
    instructions: [
      'Stand with feet shoulder-width apart, holding one rope in each hand.',
      'Bend slightly at the knees and hips, keeping your core engaged.',
      'Create waves in the ropes by moving your arms up and down rapidly.',
      'Alternate arms or move both simultaneously depending on the variation.',
    ],
  },
  'elliptical': {
    instructions: [
      'Step onto the pedals and grab the handles.',
      'Start pedaling in a smooth, elliptical motion.',
      'Maintain an upright posture and engage your core.',
      'Adjust resistance and incline as desired.',
    ],
  },
  'stairmaster': {
    instructions: [
      'Step onto the machine and select your desired intensity.',
      'Place your feet on the steps and hold the rails lightly for balance.',
      'Climb at a steady pace, pushing through your heels.',
      'Keep your core engaged and avoid leaning heavily on the rails.',
    ],
  },
};

/**
 * Get instructions for a given exercise ID.
 * Returns null if no specific instructions exist (custom exercises should show default text).
 */
export function getExerciseInstructions(exerciseId: string): ExerciseInstructions | null {
  return INSTRUCTIONS_DB[exerciseId] ?? null;
}

/**
 * Generate generic fallback instructions based on exercise metadata.
 * Used when no specific instructions exist in the database.
 */
export function generateGenericInstructions(exercise: Exercise): ExerciseInstructions {
  const { name, bodyPart, category } = exercise;

  const instructions: string[] = [
    `Set up for the ${name} with proper equipment and positioning.`,
    `Ensure your body is aligned correctly for the ${bodyPart.toLowerCase()} movement.`,
    `Execute the movement with controlled form and full range of motion.`,
    `Focus on engaging the target ${bodyPart.toLowerCase()} muscles throughout the exercise.`,
    `Return to the starting position in a controlled manner.`,
  ];

  if (category === 'Barbell' || category === 'Dumbbell') {
    instructions.push('Select an appropriate weight that allows proper form for all reps.');
    instructions.push('Increase weight gradually as strength and technique improve.');
  } else if (category === 'Machine/Other') {
    instructions.push('Adjust the machine settings to fit your body dimensions.');
    instructions.push('Select an appropriate resistance level on the machine.');
  } else if (category === 'Weighted Bodyweight' || category === 'Assisted Bodyweight') {
    instructions.push('Add or reduce resistance as needed for your fitness level.');
    instructions.push('Focus on controlled movement rather than speed.');
  } else if (category === 'Reps Only') {
    instructions.push('Perform each rep with full control and proper breathing.');
    instructions.push('Rest as needed between sets to maintain quality.');
  } else if (category === 'Cardio' || category === 'Duration') {
    instructions.push('Maintain a steady pace appropriate for your fitness level.');
    instructions.push('Monitor your heart rate and breathing throughout.');
  }

  return { instructions, tips: ['Always warm up before performing this exercise.'] };
}

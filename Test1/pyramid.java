/**
  * Generates a pyramid out of * characters of n height.
  * Author: Jatinder Bhachu
  */
class Main {
    public static void main(String[] args) {
        int n = 5;
        if(args.length >= 1) {
            try {
                n = Integer.parseInt(args[0]);
            } catch(Exception e) {
                System.out.println("Failed to parse arguments. Usage: main <n>  where n is the height");
                return;
            }
        } else {
            System.out.println("No height entered printing pyramid with height 5");
        }


        for(int i = 1; i <= n; i++) {
            String stars = generateStars(i);
            int leftPadding = (n-i) + stars.length();
            System.out.printf("%" + Integer.toString(leftPadding) + "s\n", stars);
        }
    }

    private static String generateStars(int n) {
        StringBuilder builder = new StringBuilder(n*2);

        for(int i = 0; i < n; i++) {
            // don't append a space to last string
            builder.append(i == n-1 ? "*" : "* ");
        }

        return builder.toString();
    }
}

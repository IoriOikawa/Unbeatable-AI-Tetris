import java.io.*;
import java.util.*;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

// Performs Particle Swarm Optimisation for finding best weights for heuristic of Tetris player

public class ParticleSwarm {
        public static final int MAXBOUND = 100; // Max value of Weights to test
        public static final int MINBOUND = 0; // Min value of weight
        public static final int RANGE = MAXBOUND - MINBOUND; 
        public static final int VELOCITYINIT = RANGE; // Max initial velocity of particles
        public static final int FEATURECOUNT = 6; // Number of features to assign weights to, correspond to dimension of space to search
        public static final int SWARMSIZE = 63; // Number of swarm particles
        public static final int ITERATION = 100; // Number of iteration to loop 
        public static final String FILENAME = "particle.txt";
        //public static final long testSeed = 1301478912376L; // Use a fixed seed for deterministic playing
        
        private static Random rand = new Random(); // Random number generator
        private static Particle[] particles;
        private static int gBest= 0; // Best global score
        private static double [] gBestWeight=new double[FEATURECOUNT]; // Weights of features to get gBest score
        private static  FileReader reader;
        public static StringBuilder sb;
        public static String runString;
        public static void main(String[] args) throws IOException {
                initSwarm(); // Initial particles randomly in the space
                BufferedWriter bufferedWriter = null;
                    BufferedReader br = new BufferedReader(new FileReader("/Users/BboyKellen/Downloads/TetrisFinal/tetris_train/artificial.js"));
                    try {
                        sb = new StringBuilder();
                        String line = br.readLine();

                        while (line != null) {
                            sb.append(line);
                            sb.append("\n");
                            line = br.readLine();
                        }
                    } finally {
                        br.close();
                        runString=sb.toString();
                    }
                
                
                for (int iter = 0; iter <ITERATION; iter++)
                {
                	
                        for (int i = 0; i < particles.length; i++) // Check through every particle at each iteration
                        {
                            //try {
            					//reader= new FileReader("/Users/BboyKellen/Downloads/TetrisFinal/tetris_train/artificial.js");
            				//} catch (FileNotFoundException e) {
            					// TODO Auto-generated catch block
            					//e.printStackTrace();
            				//}

                        	
                                int score  = evaluate(particles[i]); // Evaluate the current weights of the particle 
                                particles[i].updateScore(score);
                                if (score > gBest) // Update the Swarm's best score and weights
                                {
                                        gBest =score;
                                        System.arraycopy(particles[i].getWeights(), 0, gBestWeight, 0, particles[i].getWeights().length);
                                }
                                // Upate the particle position and velocity
                                particles[i].updateVelocity(gBestWeight, rand, VELOCITYINIT);
                                particles[i].updatePosition(MAXBOUND, MINBOUND);
                        }
                        
                        // Print current iteration result
                        System.out.print("Best Score in iter" +iter + " " + gBest+ " ");
                        for (int k = 0; k< gBestWeight.length; k++)
                                System.out.print(gBestWeight[k] + " ");
                        System.out.println();
                        
                        // Write to file the curent status
                        try {
                                //Construct the BufferedWriter object
                                bufferedWriter = new BufferedWriter(new FileWriter(FILENAME, true));
                                
                                //Start writing to the output stream
                                bufferedWriter.append("Iter " + iter + " Score: " + gBest + "\n");
                                for (int i = 0; i< gBestWeight.length; i++)
                                        bufferedWriter.append(gBestWeight[i] + ", ");
                                bufferedWriter.append("\n");
                        } catch (Exception ex) {
                                ex.printStackTrace();
                        } finally {
                                //Close the BufferedWriter
                                try {
                                        if (bufferedWriter != null) {
                                                bufferedWriter.flush();
                                                bufferedWriter.close();
                                        }
                                } catch (IOException ex) {
                                        ex.printStackTrace();
                                }
                        }
                }
                
                // Show End results at end required number of iterations
                System.out.print("Best Score " + gBest + " ");
                for (int i = 0; i< gBestWeight.length; i++)
                        System.out.print(gBestWeight[i] + " ");
                System.out.println();

                try {
                        //Construct the BufferedWriter object
                        bufferedWriter = new BufferedWriter(new FileWriter(FILENAME, true));

                        //Start writing to the output stream
                        bufferedWriter.append("Best Results: " + gBest + " ");
                        for (int i = 0; i< gBestWeight.length; i++)
                                bufferedWriter.append(gBestWeight[i] + ", ");
                        bufferedWriter.append("\n");
                } catch (Exception ex) {
                        ex.printStackTrace();
                } finally {
                        //Close the BufferedWriter
                        try {
                                if (bufferedWriter != null) {
                                        bufferedWriter.flush();
                                        bufferedWriter.close();
                                }
                        } catch (IOException ex) {
                                ex.printStackTrace();
                        }
                }
        }

        // Evaluate the position of a particle in the swarm space
        // by playing a single game and using the position as weights and returns score
        private static int evaluate(Particle particle) {
	        // create a script engine manager
	        ScriptEngineManager factory = new ScriptEngineManager();
	        // create JavaScript engine
	        ScriptEngine engine = factory.getEngineByName("JavaScript");
	        // evaluate JavaScript code from given file - specified by first argument
	        double[]weights=particle.getWeights();
	        engine.put("weights0",weights[0] );
	        engine.put("weights1",weights[1] );
	        engine.put("weights2",weights[2]);
	        engine.put("weights3",weights[3] );
	        engine.put("weights4",weights[4] );
	        engine.put("weights5",weights[5] );
			try {
				engine.eval(runString);
			} catch (ScriptException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}

	        double rows_removed=(double) engine.get("rows_completed");
	        //try {
				//reader.close();
			//} catch (IOException e) {
			//	// TODO Auto-generated catch block
				//e.printStackTrace();
			//}
            return (int)rows_removed;
        }

        // Initialise swarm by randomising every particle 
        private static void initSwarm() {
                particles = new Particle[SWARMSIZE];
                for (int i = 0; i < SWARMSIZE; i++)
                {
                        double [] w = generateRandomW();
                        double [] v = generateRandomV();
                        particles[i] = new Particle (w,v);
                }
        }

        // Generates random initial velocity for a particle
        private static double[] generateRandomV() {
                double [] v = new double [FEATURECOUNT];
                for (int i = 0; i < v.length; i++)
                {
                        v[i] =  rand.nextDouble()*VELOCITYINIT;
                        if (rand.nextDouble() < 0.5)
                                v[i] *= -1; // Equal change to move in either direction
                }
                return v;
        }

        // Generates an array with random values for initial location (weight) of particle
        private static double[] generateRandomW() {
                double [] w = new double [FEATURECOUNT];
                for (int i = 0; i < w.length; i++)
                {
                        w[i] =  rand.nextDouble()*RANGE+ MINBOUND;
                }
                return w;
        }
}